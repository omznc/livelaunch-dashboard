'use server';

import prisma from '@lib/prisma';
import {
	CountdownSetting,
	NotificationsFilterSettings,
} from '@app/(dashboard)/notifications/client';
const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);
import { Routes } from 'discord-api-types/v10';
import env from '@env';
import { REST } from '@discordjs/rest';
import { createWebhook } from '@lib/discord-api';
import { revalidatePath } from 'next/cache';

export const updateFilters = async (
	guildId: string,
	settings: NotificationsFilterSettings
): Promise<void> => {
	// remove countdown key

	const data = Object.fromEntries(
		Object.entries(settings).map(([key, value]) => [key, Number(value)])
	);
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			...data,
		},
	});
};

export const addCountdown = async (
	guildId: string,
	settings: CountdownSetting
): Promise<void> => {
	if (settings.days < 0 || settings.days > 31) {
		throw new Error('Invalid days');
	}
	if (settings.hours < 0 || settings.hours > 24) {
		throw new Error('Invalid hours');
	}
	if (settings.minutes < 0 || settings.minutes > 60) {
		throw new Error('Invalid minutes');
	}

	const current = await prisma.notification_countdown.count({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (current > 64) {
		throw new Error('Cooldown limit reached');
	}

	await prisma.notification_countdown.create({
		data: {
			guild_id: BigInt(guildId),
			minutes:
				settings.days * 24 * 60 +
				settings.hours * 60 +
				settings.minutes,
		},
	});

	revalidatePath('/notifications');
};

export const removeCountdown = async (
	guildId: string,
	minutes: number
): Promise<void> => {
	await prisma.notification_countdown.delete({
		where: {
			guild_id_minutes: {
				guild_id: BigInt(guildId),
				minutes,
			},
		},
	});

	revalidatePath('/notifications');
};

export const updateChannel = async (
	guildId: string,
	channelId: string
): Promise<void> => {
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			notification_channel_id: BigInt(channelId),
		},
	});

	const [webhookUrl, resp] = await Promise.all([
		createWebhook(channelId, 'NEWS'),
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				notification_webhook_url: true,
			},
		}),
	]);

	if (resp?.notification_webhook_url) {
		await rest.delete(
			Routes.webhook(resp.notification_webhook_url.split('/')[5])
		);
	}

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			notification_webhook_url: webhookUrl,
		},
	});

	revalidatePath('/notifications');
};

export const disableFeature = async (guildId: string): Promise<void> => {
	const resp = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: {
			notification_webhook_url: true,
		},
	});

	console.log(resp?.notification_webhook_url?.split('/')[5]);

	if (resp?.notification_webhook_url) {
		await rest.delete(
			Routes.webhook(resp.notification_webhook_url.split('/')[5])
		);
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

	revalidatePath('/notifications');
};
