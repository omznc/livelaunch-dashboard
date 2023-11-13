import 'server-only';

import { getUserGuilds } from '@lib/discord-api';
import { getServerSession } from 'next-auth';

import authOptions from '@app/api/auth/[...nextauth]/authOptions';

export async function isAuthorized(guildId: string) {
	const session = await getServerSession(authOptions);
	if (!session?.user || !session?.account) {
		return false;
	}
	const guilds = await getUserGuilds();
	return guilds.find(g => g.id === guildId);
}
