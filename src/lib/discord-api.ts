import 'server-only';

import {
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPIGuildChannelsResult,
	RESTPostAPIChannelWebhookResult,
} from 'discord.js';
import env from '@env';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import avatar from '@public/LiveLaunch_Webhook_Avatar.png';
import { isAuthorized } from '@lib/server-utils';

const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);

/**
 * Gets the channels the bot can send messages in
 */
export const getGuildChannels = async (guildId: string) => {
	const resp = await fetch(
		`https://discord.com/api/guilds/${guildId}/channels`,
		{
			headers: {
				authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
			},
			next: {
				revalidate: 60 * 5,
				tags: [`get-guild-channels-${guildId}`],
			},
		}
	).then(resp => resp.json());

	if (!resp || !Array.isArray(resp)) {
		console.debug('getGuildChannels received non-array', {
			resp,
		});
		return [];
	}

	return resp
		.filter(channel => channel.type === 0 || channel.type === 5)
		.sort(
			(a, b) => a.position - b.position
		) as RESTGetAPIGuildChannelsResult;
};

/**
 * Gets the guilds the bot is in
 */
export const getBotGuilds = async () => {
	const resp = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
		next: {
			revalidate: 60,
			tags: ['get-bot-guilds'],
		},
	}).then(resp => resp.json());

	if (!resp || !Array.isArray(resp)) {
		console.debug('getBotGuilds received non-array', {
			resp,
		});
		return [];
	}

	return resp as RESTAPIPartialCurrentUserGuild[];
};

/**
 * Gets the guilds the user is in
 */
export const getUserGuilds = async () => {
	const { session, user } = await isAuthorized();

	const resp = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bearer ${user.accessToken}` },
		next: {
			revalidate: 60 * 5,
			tags: [`get-user-guilds-${session.userId}`],
		},
	}).then(resp => resp.json());

	if (!resp || !Array.isArray(resp)) return [];

	return resp.filter(
		guild => (parseInt(guild.permissions) & 0x8) === 0x8
	) as RESTAPIPartialCurrentUserGuild[];
};

/**
 * Creates a webhook in the specified channel
 * @param channelId Channel ID
 * @param category Category name
 */
export const createWebhook = async (channelId: string, category: string) => {
	const resp = await fetch(`${env.PUBLIC_URL}${avatar.src}`);
	const webhook = await rest
		.post(Routes.channelWebhooks(channelId), {
			body: {
				name: `LiveLaunch ${category}`,
				avatar: `data:image/png;base64,${Buffer.from(
					await resp.arrayBuffer()
				).toString('base64')}`,
			},
		})
		.then(r => r as RESTPostAPIChannelWebhookResult)
		.catch(() => {
			return null;
		});

	return webhook ? (webhook.url as string) : null;
};
