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

const notificationsFilterSchema = z.object({
	guildId: z.string(),
	settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const updateFilters = guildActionClient
	.inputSchema(notificationsFilterSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		const data = Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, Number(value)]));
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				...data,
			},
		});
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
		const current = await prisma.notification_countdown.count({
			where: {
				guild_id: BigInt(guildId),
			},
		});

		if (current > 64) {
			throw new Error("Countdown limit reached");
		}

		await prisma.notification_countdown.create({
			data: {
				guild_id: BigInt(guildId),
				minutes: settings.days * 24 * 60 + settings.hours * 60 + settings.minutes,
			},
		});

		revalidatePath(`/notifications?g=${guildId}`);
	});

const removeCountdownSchema = z.object({
	guildId: z.string(),
	minutes: z.number(),
});

export const removeCountdown = guildActionClient
	.inputSchema(removeCountdownSchema)
	.action(async ({ parsedInput: { guildId, minutes } }) => {
		await prisma.notification_countdown.delete({
			where: {
				guild_id_minutes: {
					guild_id: BigInt(guildId),
					minutes,
				},
			},
		});

		revalidatePath(`/notifications?g=${guildId}`);
	});

const updateChannelSchema = z.object({
	guildId: z.string(),
	channelId: z.string(),
});

export const updateChannel = guildActionClient
	.inputSchema(updateChannelSchema)
	.action(async ({ parsedInput: { guildId, channelId } }) => {
		const [newWebhookURL, guild] = await Promise.all([
			createWebhook(channelId, "Notifications"),
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
				notification_webhook_url: newWebhookURL,
				notification_channel_id: BigInt(channelId),
			},
		});

		if (guild?.notification_webhook_url) {
			await rest.delete(Routes.webhook(guild.notification_webhook_url.split("/")[5])).catch(async (e) => {
				await prisma.enabled_guilds.update({
					where: {
						guild_id: BigInt(guildId),
					},
					data: {
						notification_channel_id: null,
						notification_webhook_url: null,
					},
				});
				await rest.delete(Routes.webhook(newWebhookURL.split("/")[5]));

				revalidatePath(`/notifications?g=${guildId}`);

				throw e;
			});
		} else {
			revalidatePath(`/notifications?g=${guildId}`);
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
				notification_webhook_url: true,
			},
		});

		if (resp?.notification_webhook_url) {
			await rest.delete(Routes.webhook(resp.notification_webhook_url.split("/")[5])).catch((e) => {
				logger.error(
					"notifications:actions:disableFeature",
					"Failed to delete notification webhook during disable",
					{
						guildId,
						error: e.message,
						webhookUrl: resp.notification_webhook_url,
					},
				);
			});
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

		revalidatePath(`/notifications?g=${guildId}`);
	});
