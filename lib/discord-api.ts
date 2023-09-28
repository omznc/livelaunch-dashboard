import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import {
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPIGuildChannelsResult,
	RESTPostAPIChannelWebhookResult,
} from 'discord.js';
import env from '@env';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import avatar from '@public/LiveLaunch_Webhook_Avatar.png';

const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);

/**
 * Gets the channels the bot can send messages in
 */
export const getBotChannels = async (guildId: string) => {
	const session = await getServerSession(authOptions);
	if (!session) return [];

	const resp = await fetch(
		`https://discord.com/api/guilds/${guildId}/channels`,
		{
			headers: {
				authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
			},
			next: {
				revalidate: 60 * 5,
				tags: [`get-bot-channels-${session?.account?.id}`],
			},
		}
	).then(async resp => {
		const json = await resp.json();
		return json as Promise<RESTGetAPIGuildChannelsResult>;
	});

	if (!resp) return [];

	return resp?.filter(channel => channel.type in [0, 5]);
};

export const getBotGuilds = async () => {
	return fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
		next: {
			revalidate: 60,
			tags: ['get-bot-guilds'],
		},
	}).then(async resp => {
		const json = await resp.json();

		return json as Promise<RESTAPIPartialCurrentUserGuild[]>;
	});
};

export const getUserGuilds = async () => {
	const session = await getServerSession(authOptions);
	if (!session) return [];

	const resp = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bearer ${session?.account?.access_token}` },
		next: {
			revalidate: 60 * 5,
			tags: [`get-user-guilds-${session?.account?.id}`],
		},
	}).then(async resp => {
		const json = await resp.json();
		return json as Promise<RESTAPIPartialCurrentUserGuild[]>;
	});

	if (!resp) return [];

	return resp?.filter(guild => (parseInt(guild.permissions) & 0x8) === 0x8);
};

export const createWebhook = async (channelId: string, category: string) => {
	const resp = await fetch(`${process.env.NEXTAUTH_URL}${avatar.src}`);
	const base64 = Buffer.from(await resp.arrayBuffer()).toString('base64');
	const webhook = (await rest.post(Routes.channelWebhooks(channelId), {
		body: {
			name: `LiveLaunch ${category.toUpperCase()}`,
			avatar: `data:image/png;base64,${base64}`,
		},
	})) as RESTPostAPIChannelWebhookResult;

	return webhook.url as string;
};
