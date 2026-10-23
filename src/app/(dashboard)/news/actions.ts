"use server";

import { createWebhook, deleteWebhook, replaceWebhook } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { guildActionClient, guildIdSchema, snowflakeSchema } from "@lib/safe-actions";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";

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
	channelId: snowflakeSchema,
});

export const updateChannel = guildActionClient
	.inputSchema(updateChannelSchema)
	.action(async ({ parsedInput: { guildId, channelId } }) => {
		const [newWebhookURL, guild] = await Promise.all([
			createWebhook(guildId, channelId, "News"),
			prisma.enabled_guilds.findFirst({
				where: {
					guild_id: BigInt(guildId),
				},
				select: { news_webhook_url: true },
			}),
		]);

		if (!newWebhookURL) {
			return {
				error: "Could not create a webhook. Check that the channel exists and that the bot has the Manage Webhooks permission.",
			};
		}

		await replaceWebhook(newWebhookURL, guild?.news_webhook_url, () =>
			prisma.enabled_guilds.update({
				where: {
					guild_id: BigInt(guildId),
				},
				data: {
					news_channel_id: BigInt(channelId),
					news_webhook_url: newWebhookURL,
				},
			}),
		);

		updateTag(`channels-${guildId}`);
		refresh();
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
			await deleteWebhook(resp.news_webhook_url);
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

		refresh();
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
