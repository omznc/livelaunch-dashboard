'use server';

import prisma from '@lib/prisma';
import {
	CountdownSetting,
	NotificationsFilterSettings,
} from '@app/(dashboard)/notifications/client';
import {Routes} from 'discord-api-types/v10';
import env from '@env';
import {REST} from '@discordjs/rest';
import {createWebhook} from '@lib/discord-api';
import {revalidatePath} from 'next/cache';

import {isAuthorizedForGuild} from '@lib/server-utils';

const rest = new REST({version: '9'}).setToken(env.DISCORD_BOT_TOKEN);

export const updateFilters = async (
	guildId: string,
	settings: NotificationsFilterSettings
): Promise<void> => {
	const authorized = await isAuthorizedForGuild(guildId);
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

export const addCountdown = async (
	guildId: string,
	settings: CountdownSetting
): Promise<void> => {
	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	if (settings.days < 0 || settings.days > 31) {
		console.error('Invalid days', {
			guildId,
			settings,
		});
		throw new Error('Invalid days');
	}
	if (settings.hours < 0 || settings.hours > 24) {
		console.error('Invalid hours', {
			guildId,
			settings,
		});
		throw new Error('Invalid hours');
	}
	if (settings.minutes < 0 || settings.minutes > 60) {
		console.error('Invalid minutes', {
			guildId,
			settings,
		});
		throw new Error('Invalid minutes');
	}

	if (settings.days + settings.hours + settings.minutes === 0) {
		console.error('Invalid time', {
			guildId,
			settings,
		});
		throw new Error('Invalid time');
	}

	const current = await prisma.notification_countdown.count({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (current > 64) {
		console.error('Countdown limit reached', {
			guildId,
			settings,
		});
		throw new Error('Countdown limit reached');
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

	revalidatePath(`/notifications?g=${guildId}`);
};

export const removeCountdown = async (
	guildId: string,
	minutes: number
): Promise<void> => {
	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	await prisma.notification_countdown.delete({
		where: {
			guild_id_minutes: {
				guild_id: BigInt(guildId),
				minutes,
			},
		},
	});

	revalidatePath(`/notifications?g=${guildId}`);
};

export const updateChannel = async (
	guildId: string,
	channelId: string
): Promise<void | string> => {
	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	const [newWebhookURL, guild] = await Promise.all([
		createWebhook(channelId, 'Notifications'),
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
		}),
	]);

	if (!newWebhookURL) {
		return "Missing permissions"
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
		await rest
			.delete(
				Routes.webhook(guild.notification_webhook_url.split('/')[5])
			)
			// cleanup on error
			.catch(async e => {
				await prisma.enabled_guilds.update({
					where: {
						guild_id: BigInt(guildId),
					},
					data: {
						notification_channel_id: null,
						notification_webhook_url: null,
					},
				});
				await rest.delete(Routes.webhook(newWebhookURL.split('/')[5]));

				revalidatePath(`/notifications?g=${guildId}`);

				throw e;
			});
	} else {
		revalidatePath(`/notifications?g=${guildId}`);
	}
};

export const disableFeature = async (guildId: string): Promise<void> => {
	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	const resp = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: {
			notification_webhook_url: true,
		},
	});

	if (resp?.notification_webhook_url) {
		await rest
			.delete(Routes.webhook(resp.notification_webhook_url.split('/')[5]))
			.catch(e => {
				console.error(e);
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
};
