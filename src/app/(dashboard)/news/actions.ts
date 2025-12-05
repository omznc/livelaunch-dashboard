"use server";

import { REST } from "@discordjs/rest";
import env from "@env";
import { createWebhook } from "@lib/discord-api";
import { logger } from "@lib/logger";
import { prisma } from "@lib/prisma";
import { guildActionClient, guildIdSchema } from "@lib/safe-actions";
import { Routes } from "discord-api-types/v10";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rest = new REST({ version: "9" }).setToken(env.DISCORD_BOT_TOKEN);

const newsSettingsSchema = z.object({
	guildId: z.string(),
	settings: z.object({
		whitelist: z.union([z.string(), z.number(), z.boolean()]),
	}),
});

export const updateSettings = guildActionClient
	.inputSchema(newsSettingsSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				news_include_exclude: Number(settings.whitelist),
			},
		});
	});

const updateChannelSchema = z.object({
	guildId: z.string(),
	channelId: z.string(),
});

export const updateChannel = guildActionClient
	.inputSchema(updateChannelSchema)
	.action(async ({ parsedInput: { guildId, channelId } }) => {
		const [newWebhookURL, guild] = await Promise.all([
			createWebhook(channelId, "News"),
			prisma.enabled_guilds.findFirst({
				where: {
					guild_id: BigInt(guildId),
				},
			}),
		]);

		if (!newWebhookURL) {
			return { error: "Missing permission: Manage Webhooks" };
		}

		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				news_channel_id: BigInt(channelId),
				news_webhook_url: newWebhookURL,
			},
		});

		if (guild?.news_webhook_url) {
			await rest.delete(Routes.webhook(guild.news_webhook_url.split("/")[5])).catch(async (e) => {
				await prisma.enabled_guilds.update({
					where: {
						guild_id: BigInt(guildId),
					},
					data: {
						news_channel_id: null,
						news_webhook_url: null,
					},
				});
				await rest.delete(Routes.webhook(newWebhookURL.split("/")[5]));

				revalidatePath(`/news?g=${guildId}`);
				throw e;
			});
		} else {
			revalidatePath(`/news?g=${guildId}`);
		}

		return { success: true };
	});

export const disableFeature = guildActionClient
	.inputSchema(guildIdSchema)
	.action(async ({ parsedInput: { guildId } }) => {
		const resp = await prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				news_webhook_url: true,
			},
		});

		if (resp?.news_webhook_url) {
			await rest.delete(Routes.webhook(resp.news_webhook_url.split("/")[5])).catch((e) => {
				logger.error("news:actions:disableFeature", "Failed to delete news webhook during disable", {
					guildId,
					error: e.message,
					webhookUrl: resp.news_webhook_url,
				});
			});
		}

		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				news_channel_id: null,
				news_webhook_url: null,
			},
		});

		revalidatePath(`/news?g=${guildId}`);
	});

const setNewsSitesSchema = z.object({
	guildId: z.string(),
	newsSites: z.array(
		z.object({
			news_site_id: z.number(),
			selected: z.boolean(),
		}),
	),
});

export const setNewsSites = guildActionClient
	.inputSchema(setNewsSitesSchema)
	.action(async ({ parsedInput: { guildId, newsSites } }) => {
		return Promise.all([
			prisma.news_filter.deleteMany({
				where: {
					guild_id: BigInt(guildId),
					news_site_id: {
						in: newsSites.filter((n) => !n.selected).map((n) => n.news_site_id),
					},
				},
			}),
			prisma.news_filter.createMany({
				data: newsSites
					.filter((n) => n.selected)
					.map((n) => ({
						guild_id: BigInt(guildId),
						news_site_id: n.news_site_id,
					})),
				skipDuplicates: true,
			}),
		]);
	});
