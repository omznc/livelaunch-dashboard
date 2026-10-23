"use server";

import { createWebhook, deleteWebhook, replaceWebhook } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { guildActionClient, guildIdSchema, snowflakeSchema } from "@lib/safe-actions";
import { toFlags } from "@lib/server-utils";
import { refresh } from "next/cache";
import { z } from "zod";

const generalSettingsSchema = z.object({
	guildId: z.string(),
	settings: z.object({
		notification_button_fc: z.boolean().optional(),
		notification_button_g4l: z.boolean().optional(),
		notification_button_sln: z.boolean().optional(),
		se_launch: z.boolean().optional(),
		se_event: z.boolean().optional(),
		se_no_url: z.boolean().optional(),
	}),
});

export const updateSettings = guildActionClient
	.inputSchema(generalSettingsSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: toFlags(settings),
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
			createWebhook(guildId, channelId, "Messages"),
			prisma.enabled_guilds.findFirst({
				where: {
					guild_id: BigInt(guildId),
				},
			}),
		]);

		if (!newWebhookURL) {
			return {
				error: "Could not create a webhook. Check that the channel exists and that the bot has the Manage Webhooks permission.",
			};
		}

		await replaceWebhook(newWebhookURL, guild?.webhook_url, () =>
			prisma.enabled_guilds.update({
				where: {
					guild_id: BigInt(guildId),
				},
				data: {
					channel_id: BigInt(channelId),
					webhook_url: newWebhookURL,
				},
			}),
		);

		refresh();
		return { success: true };
	});

const updateNumberOfEventsSchema = z.object({
	guildId: z.string(),
	num: z.number().int().min(0).max(50),
});

export const updateNumberOfEvents = guildActionClient
	.inputSchema(updateNumberOfEventsSchema)
	.action(async ({ parsedInput: { guildId, num } }) => {
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				scheduled_events: num,
			},
		});

		refresh();
	});

export const disableFeature = guildActionClient
	.inputSchema(guildIdSchema)
	.action(async ({ parsedInput: { guildId } }) => {
		const resp = await prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				webhook_url: true,
			},
		});

		if (resp?.webhook_url) {
			await deleteWebhook(resp.webhook_url);
		}

		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				channel_id: null,
				webhook_url: null,
			},
		});

		refresh();
	});
