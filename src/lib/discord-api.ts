import "server-only";

import { REST } from "@discordjs/rest";
import env from "@env";
import { auth } from "@lib/auth";
import { logger } from "@lib/logger";
import { prisma } from "@lib/prisma";
import { isAuthorized } from "@lib/server-utils";
import avatar from "@public/LiveLaunch_Webhook_Avatar.png";
import type {
	APIApplication,
	APIGuild,
	APIGuildMember,
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPIGuildChannelsResult,
	RESTPostAPIChannelWebhookResult,
} from "discord.js";
import { PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { headers } from "next/headers";

const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
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

const handleRateLimit = async (response: Response, actor: "user" | "bot"): Promise<boolean> => {
	if (response.status === 429) {
		try {
			const data = await response.json();
			if (data.retry_after) {
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
			}
			logger.debug("discord-api:handleRateLimit", `${actor} token rate limited but no retry_after provided`, {
				actor,
				status: response.status,
			});
		} catch (error) {
			logger.debug("discord-api:handleRateLimit", `${actor} token rate limit parse failed`, {
				actor,
				status: response.status,
				error,
			});
		}
	}
	return false;
};

/**
 * Gets the channels the bot can send messages in
 */
export const getGuildChannels = async (guildId: string): Promise<RESTGetAPIGuildChannelsResult> => {
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
};

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

/**
 * Gets the guilds the user is in
 */
export const getUserGuilds = async (retryCount = 0): Promise<RESTAPIPartialCurrentUserGuild[]> => {
	const MAX_RETRIES = 3;
	try {
		const data = await isAuthorized();
		if (!data) {
			logger.debug("discord-api:getUserGuilds", "Early return: user not authorized");
			return [];
		}
		const { user } = data;

		const { accessToken } = await auth.api.getAccessToken({
			headers: await headers(),
			body: {
				providerId: "discord",
			},
		});

		if (!accessToken) {
			logger.debug("discord-api:getUserGuilds", "Early return: failed to get access token", { userId: user.id });
			return [];
		}

		logger.debug("discord-api:getUserGuilds", "Got access token", {
			userId: user.id,
			tokenPrefix: accessToken.substring(0, 20),
			tokenLength: accessToken.length,
		});

		const response = await fetch("https://discord.com/api/users/@me/guilds", {
			cache: "force-cache",
			headers: { authorization: `Bearer ${accessToken}` },
			next: {
				revalidate: 30,
				tags: [`get-user-guilds-${user.id}`],
			},
		});

		if (!response.ok) {
			if (await handleRateLimit(response, "user")) {
				if (retryCount >= MAX_RETRIES) {
					logger.error("discord-api:getUserGuilds", "Max retries reached for rate limit", {
						userId: user.id,
						retryCount,
					});
					return [];
				}
				logger.debug("discord-api:getUserGuilds", "Rate limited, retrying", {
					userId: user.id,
					retryCount: retryCount + 1,
				});
				return getUserGuilds(retryCount + 1);
			}
			const errorBody = await response.text().catch(() => "failed to read error body");
			logger.error("discord-api:getUserGuilds", "API error when getting user guilds", {
				status: response.status,
				userId: user.id,
				errorBody,
				tokenPrefix: accessToken.substring(0, 20),
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
 * Creates a webhook in the specified channel
 * @param channelId Channel ID
 * @param category Category name
 */
export const createWebhook = async (channelId: string, category: string): Promise<string | null> => {
	if (!channelId || typeof channelId !== "string") {
		logger.debug("discord-api:createWebhook", "Invalid channelId provided", { channelId, category });
		return null;
	}
	if (!category || typeof category !== "string") {
		logger.debug("discord-api:createWebhook", "Invalid category provided", { channelId, category });
		return null;
	}
	try {
		const avatarResponse = await fetch(`${env.PUBLIC_URL}${avatar.src}`);
		if (!avatarResponse.ok) {
			logger.error("discord-api:createWebhook", "Failed to fetch avatar", {
				channelId,
				category,
				status: avatarResponse.status,
			});
			throw new Error(`Failed to fetch avatar: ${avatarResponse.status}`);
		}

		const webhook = (await rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name: `LiveLaunch ${category}`,
				avatar: `data:image/png;base64,${Buffer.from(await avatarResponse.arrayBuffer()).toString("base64")}`,
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

/**
 * Gets the bot's permissions in a guild
 */
export const getBotPermissions = async (guildId: string): Promise<string | null> => {
	if (!guildId || typeof guildId !== "string") {
		logger.debug("discord-api:getBotPermissions", "Invalid guildId provided", { guildId });
		return null;
	}
	try {
		const [guild, app] = await Promise.all([
			rest.get(Routes.guild(guildId)) as Promise<APIGuild>,
			rest.get(Routes.oauth2CurrentApplication()) as Promise<APIApplication>,
		]);

		const botUserId = app.bot?.id;
		if (!botUserId) {
			logger.debug("discord-api:getBotPermissions", "Early return: could not get bot user ID", { guildId });
			return null;
		}

		const member = (await rest.get(Routes.guildMember(guildId, botUserId))) as APIGuildMember;

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
};

export interface PermissionStatus {
	name: string;
	description: string;
	hasPermission: boolean;
}

export interface BotPermissionCheck {
	hasAll: boolean;
	permissions: PermissionStatus[];
}

/**
 * Checks if the bot has required permissions in a guild
 */
export const checkBotPermissions = async (guildId: string): Promise<BotPermissionCheck> => {
	if (!guildId || typeof guildId !== "string") {
		logger.debug("discord-api:checkBotPermissions", "Invalid guildId provided", { guildId });
		return {
			hasAll: false,
			permissions: [
				{
					name: "Manage Webhooks",
					description: "Required to create webhooks for messages",
					hasPermission: false,
				},
				{
					name: "Manage Events",
					description: "Required to edit and cancel Discord scheduled events",
					hasPermission: false,
				},
				{
					name: "Create Events",
					description: "Required to create Discord scheduled events",
					hasPermission: false,
				},
				{ name: "Send Messages", description: "Required to send messages to channels", hasPermission: false },
				{ name: "Embed Links", description: "Required to send rich embeds with links", hasPermission: false },
			],
		};
	}
	const permissions = await getBotPermissions(guildId);
	if (!permissions) {
		logger.debug("discord-api:checkBotPermissions", "Early return: could not get bot permissions", { guildId });
		return {
			hasAll: false,
			permissions: [
				{
					name: "Manage Webhooks",
					description: "Required to create webhooks for messages",
					hasPermission: false,
				},
				{
					name: "Manage Events",
					description: "Required to edit and cancel Discord scheduled events",
					hasPermission: false,
				},
				{
					name: "Create Events",
					description: "Required to create Discord scheduled events",
					hasPermission: false,
				},
				{ name: "Send Messages", description: "Required to send messages to channels", hasPermission: false },
				{ name: "Embed Links", description: "Required to send rich embeds with links", hasPermission: false },
			],
		};
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
		permissions: permissionChecks,
	};
};
