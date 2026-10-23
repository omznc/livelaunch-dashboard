import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { DiscordAPIError, REST } from "@discordjs/rest";
import env from "@env";
import { auth } from "@lib/auth";
import { logger } from "@lib/logger";
import { prisma } from "@lib/prisma";
import { isAuthorized } from "@lib/server-utils";
import type {
	APIApplication,
	APIGuild,
	APIGuildMember,
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPIGuildChannelsResult,
	RESTPostAPIChannelWebhookResult,
} from "discord-api-types/v10";
import { PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { headers } from "next/headers";
import { cache } from "react";

export const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
rest.on("rateLimited", (info) => {
	logger.warn("discord-api:handleRateLimit", "Bot token rate limited", {
		actor: "bot",
		timeToReset: info.timeToReset,
		limit: info.limit,
		method: info.method,
		route: info.route,
		global: info.global,
	});
});

const MAX_RETRY_AFTER_SECONDS = 5;

// Waits and returns true only for a short rate limit. A long one fails fast.
const handleRateLimit = async (response: Response, actor: "user" | "bot"): Promise<boolean> => {
	if (response.status !== 429) return false;
	try {
		const data = await response.json();
		if (!data.retry_after || data.retry_after > MAX_RETRY_AFTER_SECONDS) {
			logger.warn("discord-api:handleRateLimit", `${actor} token rate limited, not retrying`, {
				actor,
				retryAfter: data.retry_after,
			});
			return false;
		}
		logger.warn(
			"discord-api:handleRateLimit",
			`${actor} token rate limited, waiting ${data.retry_after * 1000}ms`,
			{
				actor,
				retryAfter: data.retry_after,
			},
		);
		await new Promise((resolve) => setTimeout(resolve, data.retry_after * 1000));
		return true;
	} catch (error) {
		logger.debug("discord-api:handleRateLimit", `${actor} token rate limit parse failed`, {
			actor,
			status: response.status,
			error,
		});
		return false;
	}
};

const SNOWFLAKE = /^\d{17,20}$/;

/**
 * Gets the channels the bot can send messages in (once for each request)
 */
export const getGuildChannels = cache(async (guildId: string): Promise<RESTGetAPIGuildChannelsResult> => {
	if (!guildId || typeof guildId !== "string") {
		logger.debug("discord-api:getGuildChannels", "Invalid guildId provided", { guildId });
		return [];
	}
	try {
		const channels = (await rest.get(Routes.guildChannels(guildId))) as RESTGetAPIGuildChannelsResult;
		const filtered = channels.filter((channel) => channel.type === 0 || channel.type === 5);
		logger.debug("discord-api:getGuildChannels", "Successfully retrieved guild channels", {
			guildId,
			count: filtered.length,
		});
		return filtered;
	} catch (error) {
		logger.error("discord-api:getGuildChannels", "Failed to get guild channels", { guildId, error });
		return [];
	}
});

/**
 * Gets the guilds the bot is in
 */
export const getBotGuilds = async (): Promise<RESTAPIPartialCurrentUserGuild[]> => {
	try {
		const guilds = await prisma.guilds.findMany({
			select: {
				guild_id: true,
			},
		});
		const mapped = guilds.map(
			(guild) =>
				({
					id: guild.guild_id.toString(),
				}) as RESTAPIPartialCurrentUserGuild,
		);
		logger.debug("discord-api:getBotGuilds", "Successfully retrieved bot guilds", { count: mapped.length });
		return mapped;
	} catch (error) {
		logger.error("discord-api:getBotGuilds", "Failed to get bot guilds", { error });
		return [];
	}
};

const MAX_USER_GUILD_RETRIES = 1;

const fetchUserGuilds = async (retryCount: number): Promise<RESTAPIPartialCurrentUserGuild[]> => {
	try {
		const data = await isAuthorized();
		if (!data) {
			logger.debug("discord-api:getUserGuilds", "Early return: user not authorized");
			return [];
		}
		const { user } = data;

		const account = await prisma.account.findFirst({
			where: { userId: user.id, providerId: "discord" },
			select: { id: true },
		});
		if (!account) {
			logger.debug("discord-api:getUserGuilds", "Early return: no discord account", { userId: user.id });
			return [];
		}

		const { accessToken } = await auth.api.getAccessToken({
			headers: await headers(),
			body: {
				accountId: account.id,
			},
		});

		if (!accessToken) {
			logger.debug("discord-api:getUserGuilds", "Early return: failed to get access token", { userId: user.id });
			return [];
		}

		const response = await fetch("https://discord.com/api/users/@me/guilds", {
			cache: "force-cache",
			headers: { authorization: `Bearer ${accessToken}` },
			next: {
				revalidate: 30,
				tags: [`get-user-guilds-${user.id}`],
			},
		});

		if (!response.ok) {
			if (retryCount < MAX_USER_GUILD_RETRIES && (await handleRateLimit(response, "user"))) {
				return fetchUserGuilds(retryCount + 1);
			}
			const errorBody = await response.text().catch(() => "failed to read error body");
			logger.error("discord-api:getUserGuilds", "API error when getting user guilds", {
				status: response.status,
				userId: user.id,
				errorBody,
			});
			return [];
		}

		const guilds = await response.json();
		if (!Array.isArray(guilds)) {
			logger.debug("discord-api:getUserGuilds", "Early return: response is not an array", {
				userId: user.id,
				type: typeof guilds,
			});
			return [];
		}

		const filtered = guilds.filter(
			(guild) =>
				(BigInt(guild.permissions) & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator,
		) as RESTAPIPartialCurrentUserGuild[];

		logger.debug("discord-api:getUserGuilds", "Successfully retrieved user guilds", {
			userId: user.id,
			total: guilds.length,
			admin: filtered.length,
		});
		return filtered;
	} catch (error) {
		logger.error("discord-api:getUserGuilds", "Failed to get user guilds", { error });
		return [];
	}
};

/**
 * Gets the guilds the user is in (once for each request)
 */
export const getUserGuilds = cache(() => fetchUserGuilds(0));

let avatarPromise: Promise<string> | null = null;

// Reads from disk. The Dockerfile copies public/ into the standalone image.
const getAvatarDataUri = () => {
	avatarPromise ??= readFile(path.join(process.cwd(), "public", "LiveLaunch_Webhook_Avatar.png"))
		.then((file) => `data:image/png;base64,${file.toString("base64")}`)
		.catch((error) => {
			avatarPromise = null;
			throw error;
		});
	return avatarPromise;
};

/**
 * Creates a webhook in the specified channel
 * @param guildId Guild ID that must own the channel
 * @param channelId Channel ID
 * @param category Category name
 */
export const createWebhook = async (guildId: string, channelId: string, category: string): Promise<string | null> => {
	if (!SNOWFLAKE.test(channelId ?? "")) {
		logger.debug("discord-api:createWebhook", "Invalid channelId provided", { channelId, category });
		return null;
	}
	if (!category || typeof category !== "string") {
		logger.debug("discord-api:createWebhook", "Invalid category provided", { channelId, category });
		return null;
	}
	try {
		const channels = await getGuildChannels(guildId);
		if (!channels.some((channel) => channel.id === channelId)) {
			logger.warn("discord-api:createWebhook", "Channel is not in the guild", { guildId, channelId });
			return null;
		}

		const webhook = (await rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name: `LiveLaunch ${category}`,
				avatar: await getAvatarDataUri(),
			},
		})) as RESTPostAPIChannelWebhookResult;

		if (!webhook.url) {
			logger.debug("discord-api:createWebhook", "Webhook created but no URL returned", {
				channelId,
				category,
				webhookId: webhook.id,
			});
			return null;
		}

		logger.debug("discord-api:createWebhook", "Successfully created webhook", {
			channelId,
			category,
			webhookId: webhook.id,
		});
		return webhook.url;
	} catch (error) {
		logger.error("discord-api:createWebhook", "Failed to create webhook", { channelId, category, error });
		return null;
	}
};

// Webhook URL shape: https://discord.com/api/webhooks/{id}/{token}
const parseWebhookId = (url: string): string | null => {
	try {
		const parts = new URL(url).pathname.split("/").filter(Boolean);
		const index = parts.indexOf("webhooks");
		const id = index === -1 ? undefined : parts[index + 1];
		return id && SNOWFLAKE.test(id) ? id : null;
	} catch {
		return null;
	}
};

/**
 * Deletes a webhook by URL. Never throws. A missing webhook (404) counts as success.
 */
export const deleteWebhook = async (url: string): Promise<boolean> => {
	const id = parseWebhookId(url);
	if (!id) {
		logger.error("discord-api:deleteWebhook", "Unexpected webhook URL shape");
		return false;
	}
	try {
		await rest.delete(Routes.webhook(id));
		return true;
	} catch (error) {
		if (error instanceof DiscordAPIError && error.status === 404) return true;
		logger.error("discord-api:deleteWebhook", "Failed to delete webhook", {
			webhookId: id,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
};

/**
 * Saves the new webhook, then deletes the old one.
 * If the save fails, the new webhook is deleted and the error is thrown again.
 * If the old webhook cannot be deleted, the new webhook stays.
 */
export const replaceWebhook = async (
	newUrl: string,
	oldUrl: string | null | undefined,
	save: () => Promise<unknown>,
) => {
	try {
		await save();
	} catch (error) {
		await deleteWebhook(newUrl);
		throw error;
	}
	if (oldUrl) await deleteWebhook(oldUrl);
};

let botUserIdPromise: Promise<string | undefined> | null = null;

const getBotUserId = () => {
	botUserIdPromise ??= (rest.get(Routes.oauth2CurrentApplication()) as Promise<APIApplication>)
		.then((app) => app.bot?.id)
		.catch((error) => {
			botUserIdPromise = null;
			throw error;
		});
	return botUserIdPromise;
};

/**
 * Gets the bot's permissions in a guild (once for each request)
 */
export const getBotPermissions = cache(async (guildId: string): Promise<string | null> => {
	if (!guildId || typeof guildId !== "string") {
		logger.debug("discord-api:getBotPermissions", "Invalid guildId provided", { guildId });
		return null;
	}
	try {
		const botUserId = await getBotUserId();
		if (!botUserId) {
			logger.debug("discord-api:getBotPermissions", "Early return: could not get bot user ID", { guildId });
			return null;
		}

		const [guild, member] = await Promise.all([
			rest.get(Routes.guild(guildId)) as Promise<APIGuild>,
			rest.get(Routes.guildMember(guildId, botUserId)) as Promise<APIGuildMember>,
		]);

		let permissions = BigInt(guild.roles.find((r) => r.id === guildId)?.permissions || "0");

		for (const roleId of member.roles) {
			const role = guild.roles.find((r) => r.id === roleId);
			if (role) {
				permissions |= BigInt(role.permissions);
			}
		}

		logger.debug("discord-api:getBotPermissions", "Successfully retrieved bot permissions", {
			guildId,
			botUserId,
			permissions: permissions.toString(),
		});
		return permissions.toString();
	} catch (error) {
		logger.error("discord-api:getBotPermissions", "Failed to get bot permissions", { guildId, error });
		return null;
	}
});

export interface PermissionStatus {
	name: string;
	description: string;
	hasPermission: boolean;
}

export interface BotPermissionCheck {
	hasAll: boolean;
	// True when the Discord lookup failed. Then `permissions` says nothing about the real state.
	lookupFailed: boolean;
	permissions: PermissionStatus[];
}

// A failed lookup is not a missing permission. hasAll stays false, so access is still denied.
function lookupFailedResult(): BotPermissionCheck {
	return {
		hasAll: false,
		lookupFailed: true,
		permissions: [
			{ name: "Manage Webhooks", description: "Required to create webhooks for messages", hasPermission: false },
			{
				name: "Manage Events",
				description: "Required to edit and cancel Discord scheduled events",
				hasPermission: false,
			},
			{ name: "Create Events", description: "Required to create Discord scheduled events", hasPermission: false },
			{ name: "Send Messages", description: "Required to send messages to channels", hasPermission: false },
			{ name: "Embed Links", description: "Required to send rich embeds with links", hasPermission: false },
		],
	};
}

/**
 * Checks if the bot has required permissions in a guild
 */
export const checkBotPermissions = async (guildId: string): Promise<BotPermissionCheck> => {
	if (!guildId || typeof guildId !== "string") {
		logger.debug("discord-api:checkBotPermissions", "Invalid guildId provided", { guildId });
		return lookupFailedResult();
	}
	const permissions = await getBotPermissions(guildId);
	if (!permissions) {
		logger.debug("discord-api:checkBotPermissions", "Early return: could not get bot permissions", { guildId });
		return lookupFailedResult();
	}

	const permissionBits = BigInt(permissions);

	const hasAdministrator = (permissionBits & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator;

	const permissionChecks: PermissionStatus[] = [
		{
			name: "Manage Webhooks",
			description: "Required to create webhooks for messages",
			hasPermission:
				hasAdministrator ||
				(permissionBits & PermissionFlagsBits.ManageWebhooks) === PermissionFlagsBits.ManageWebhooks,
		},
		{
			name: "Manage Events",
			description: "Required to edit and cancel Discord scheduled events",
			hasPermission:
				hasAdministrator ||
				(permissionBits & PermissionFlagsBits.ManageEvents) === PermissionFlagsBits.ManageEvents,
		},
		{
			name: "Create Events",
			description: "Required to create Discord scheduled events",
			hasPermission:
				hasAdministrator ||
				(permissionBits & PermissionFlagsBits.CreateEvents) === PermissionFlagsBits.CreateEvents,
		},
		{
			name: "Send Messages",
			description: "Required to send messages to channels",
			hasPermission:
				hasAdministrator ||
				(permissionBits & PermissionFlagsBits.SendMessages) === PermissionFlagsBits.SendMessages,
		},
		{
			name: "Embed Links",
			description: "Required to send rich embeds with links",
			hasPermission:
				hasAdministrator ||
				(permissionBits & PermissionFlagsBits.EmbedLinks) === PermissionFlagsBits.EmbedLinks,
		},
	];

	const hasAll = permissionChecks.every((p) => p.hasPermission);

	logger.debug("discord-api:checkBotPermissions", "Permission check completed", {
		guildId,
		hasAll,
		hasAdministrator,
		permissions: permissionChecks.map((p) => ({ name: p.name, has: p.hasPermission })),
	});

	return {
		hasAll,
		lookupFailed: false,
		permissions: permissionChecks,
	};
};
