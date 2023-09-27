'use server';

import prisma from '@lib/prisma';
import { GeneralSettings } from '@app/(dashboard)/general/client';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import env from '@env';
import { createWebhook } from '@lib/discord-api';
import { revalidatePath } from 'next/cache';

const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);

export const updateSettings = async (
	guildId: string,
	settings: GeneralSettings
): Promise<void> => {
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

export const updateChannel = async (
	guildId: string,
	channelId: string
): Promise<void> => {
	const [webhookUrl, resp] = await Promise.all([
		createWebhook(channelId, 'MESSAGES'),
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				webhook_url: true,
			},
		}),
	]);

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			channel_id: BigInt(channelId),
		},
	});

	if (resp?.webhook_url) {
		await rest.delete(Routes.webhook(resp.webhook_url.split('/')[5]));
	}

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			webhook_url: webhookUrl,
		},
	});

	revalidatePath('/general');
};

export const updateNumberOfEvents = async (
	guildId: string,
	num: number
): Promise<void> => {
	if (num > 50 || num < 0) return;

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			scheduled_events: num,
		},
	});

	revalidatePath('/general');
};

export const disableFeature = async (guildId: string): Promise<void> => {
	const resp = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: {
			webhook_url: true,
		},
	});

	console.log(resp?.webhook_url?.split('/')[5]);

	if (resp?.webhook_url) {
		await rest.delete(Routes.webhook(resp.webhook_url.split('/')[5]));
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

	revalidatePath('/general');
};
