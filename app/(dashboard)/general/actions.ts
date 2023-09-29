'use server';

import prisma from '@lib/prisma';
import { GeneralSettings } from '@app/(dashboard)/general/client';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import env from '@env';
import { createWebhook } from '@lib/discord-api';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { isAuthorized } from '@lib/server-utils';

const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);

export const updateSettings = async (
	guildId: string,
	settings: GeneralSettings
): Promise<void> => {
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

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
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	const [newWebhookURL, guild] = await Promise.all([
		createWebhook(channelId, 'Messages'),
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
		}),
	]);

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			channel_id: BigInt(channelId),
			webhook_url: newWebhookURL,
		},
	});

	if (guild?.webhook_url) {
		await rest
			.delete(Routes.webhook(guild.webhook_url.split('/')[5]))
			// cleanup on error
			.catch(async e => {
				await prisma.enabled_guilds.update({
					where: {
						guild_id: BigInt(guildId),
					},
					data: {
						channel_id: null,
						webhook_url: null,
					},
				});
				await rest.delete(Routes.webhook(newWebhookURL.split('/')[5]));

				revalidatePath('/general');
				throw e;
			});
	} else {
		revalidatePath('/general');
	}
};

export const updateNumberOfEvents = async (
	guildId: string,
	num: number
): Promise<void> => {
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

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
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	const resp = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: {
			webhook_url: true,
		},
	});

	if (resp?.webhook_url) {
		await rest
			.delete(Routes.webhook(resp.webhook_url.split('/')[5]))
			.catch(e => {
				console.error(e);
			});
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
