'use server';

import { revalidateTag } from 'next/cache';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export const revalidateGuilds = async () => {
	const session = await getServerSession(authOptions);
	if (!session?.user) return;

	revalidateTag('get-bot-guilds');
	revalidateTag(`get-user-guilds-${session?.account?.id}`);
};
