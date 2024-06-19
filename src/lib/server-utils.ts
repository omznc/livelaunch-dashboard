import 'server-only';

import { getUserGuilds } from '@lib/discord-api';
import { validateRequest } from '@lib/auth';
import { redirect } from 'next/navigation';

export async function isAuthorizedForGuild(guildId: string) {
	const { session } = await validateRequest();
	if (!session) return false;

	const guilds = await getUserGuilds();
	return guilds.find(g => g.id === guildId);
}

export async function isAuthorized() {
	const { session, user } = await validateRequest();
	if (!session || !user) return redirect('/login');
	return { session, user };
}
