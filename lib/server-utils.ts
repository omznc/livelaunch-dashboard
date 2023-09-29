'use server';

import { getUserGuilds } from '@lib/discord-api';

export async function isAuthorized(guildId: string) {
	const guilds = await getUserGuilds();
	return guilds.find(g => g.id === guildId);
}
