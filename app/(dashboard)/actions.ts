'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import prisma from '@lib/prisma';

export const revalidateGuilds = async () => {
	const session = await getServerSession(authOptions);
	if (!session?.user) return;

	revalidateTag('get-bot-guilds');
	revalidateTag(`get-user-guilds-${session?.account?.id}`);
};

export const revalidateAll = async () => {
	revalidatePath('/agencies', 'page');
	revalidatePath('/news-sites');
};

export const getGuild = async (id: string) => {
	const session = await getServerSession(authOptions);
	if (!session?.user) return;

	return prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(id),
		},
	});
};

export const enableGuild = async (id: string) => {
	const session = await getServerSession(authOptions);
	if (!session?.user) return;

	await prisma.enabled_guilds.upsert({
		where: {
			guild_id: BigInt(id),
		},
		create: {
			guild_id: BigInt(id),
		},
		update: {},
	});

	revalidatePath('/');
};
