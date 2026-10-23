"use server";

import { createWebhook, deleteWebhook, replaceWebhook } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { guildActionClient, guildIdSchema, snowflakeSchema } from "@lib/safe-actions";
import { toFlags } from "@lib/server-utils";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { notificationsFilterSchema } from "./schemas";

const MAX_COUNTDOWNS = 64;

export const updateFilters = guildActionClient
	.inputSchema(notificationsFilterSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: toFlags(settings),
		});

		refresh();
	});

const addCountdownSchema = z.object({
	guildId: z.string(),
	settings: z
		.object({
			days: z.number().min(0).max(31),
			hours: z.number().min(0).max(24),
			minutes: z.number().min(0).max(60),
		})
		.refine((data) => data.days + data.hours + data.minutes > 0, {
			message: "At least one time unit must be greater than 0",
		}),
});

export const addCountdown = guildActionClient
	.inputSchema(addCountdownSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		await prisma.$transaction(
			async (tx) => {
				const current = await tx.notification_countdown.count({
					where: {
						guild_id: BigInt(guildId),
					},
				});

				if (current >= MAX_COUNTDOWNS) {
					throw new Error("Countdown limit reached");
				}

				await tx.notification_countdown.create({
					data: {
						guild_id: BigInt(guildId),
						minutes: settings.days * 24 * 60 + settings.hours * 60 + settings.minutes,
					},
				});
				// Serializable, so two requests cannot both pass the limit check
			},
			{ isolationLevel: "Serializable" },
		);

		refresh();
	});

const removeCountdownSchema = z.object({
	guildId: z.string(),
	minutes: z.number(),
});

export const removeCountdown = guildActionClient
	.inputSchema(removeCountdownSchema)
	.action(async ({ parsedInput: { guildId, minutes } }) => {
		await prisma.notification_countdown.deleteMany({
			where: {
				guild_id: BigInt(guildId),
				minutes,
			},
		});

		refresh();
	});

const updateChannelSchema = z.object({
	guildId: z.string(),
	channelId: snowflakeSchema,
});

export const updateChannel = guildActionClient
	.inputSchema(updateChannelSchema)
	.action(async ({ parsedInput: { guildId, channelId } }) => {
		const [newWebhookURL, guild] = await Promise.all([
			createWebhook(guildId, channelId, "Notifications"),
			prisma.enabled_guilds.findFirst({
				where: {
					guild_id: BigInt(guildId),
				},
				select: { notification_webhook_url: true },
			}),
		]);

		if (!newWebhookURL) {
			return {
				error: "Could not create a webhook. Check that the channel exists and that the bot has the Manage Webhooks permission.",
			};
		}

		await replaceWebhook(newWebhookURL, guild?.notification_webhook_url, () =>
			prisma.enabled_guilds.update({
				where: {
					guild_id: BigInt(guildId),
				},
				data: {
					notification_webhook_url: newWebhookURL,
					notification_channel_id: BigInt(channelId),
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
				notification_webhook_url: true,
			},
		});

		if (resp?.notification_webhook_url) {
			await deleteWebhook(resp.notification_webhook_url);
		}

		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				notification_channel_id: null,
				notification_webhook_url: null,
			},
		});

		refresh();
	});
