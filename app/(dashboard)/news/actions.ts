'use server';

import prisma from '@lib/prisma';
import { NewsSite, NewsSitesSettings } from '@app/(dashboard)/news/client';
import { createWebhook, getUserGuilds } from '@lib/discord-api';
import { REST } from '@discordjs/rest';
import env from '@env';
import { Routes } from 'discord-api-types/v10';
import { revalidatePath } from 'next/cache';
import { Logger } from 'next-axiom';
const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);
const log = new Logger();

export async function updateSettings(
	guildId: string,
	settings: NewsSitesSettings
): Promise<void> {
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			news_include_exclude: Number(settings.whitelist),
		},
	});
}

export const updateChannel = async (
	guildId: string,
	channelId: string
): Promise<void> => {
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			news_channel_id: BigInt(channelId),
		},
	});

	const [webhookUrl, resp] = await Promise.all([
		createWebhook(channelId, 'News'),
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				news_webhook_url: true,
			},
		}),
	]);

	if (resp?.news_webhook_url) {
		await rest.delete(Routes.webhook(resp.news_webhook_url.split('/')[5]));
	}

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			news_webhook_url: webhookUrl,
		},
	});

	revalidatePath('/news');
};

export const disableFeature = async (guildId: string): Promise<void> => {
	const resp = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: {
			news_webhook_url: true,
		},
	});

	console.log(resp?.news_webhook_url?.split('/')[5]);

	if (resp?.news_webhook_url) {
		await rest.delete(Routes.webhook(resp.news_webhook_url.split('/')[5]));
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

	revalidatePath('/news');
};

export const setNewsSites = async (newsSites: NewsSite[], guildId: string) => {
	const authorized = await getUserGuilds().then(guilds =>
		guilds.find(g => g.id === guildId)
	);

	if (!authorized) {
		log.error('Guild not found', {
			guildId,
		});
		await log.flush();
		throw new Error('Guild not found');
	}

	return Promise.all([
		prisma.news_filter.deleteMany({
			where: {
				guild_id: BigInt(guildId),
				news_site_id: {
					in: newsSites
						.filter(n => !n.selected)
						.map(n => n.news_site_id),
				},
			},
		}),
		prisma.news_filter.createMany({
			data: newsSites
				.filter(n => n.selected)
				.map(n => ({
					guild_id: BigInt(guildId),
					news_site_id: n.news_site_id,
				})),
			skipDuplicates: true,
		}),
	]);
};
