'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@lib/prisma';
import { isAuthorizedForGuild } from '@lib/server-utils';
import { validateRequest } from '@lib/auth';

export const revalidateGuilds = async () => {
	const { session } = await validateRequest();
	if (!session) return;

	revalidateTag('get-bot-guilds');
	revalidateTag(`get-user-guilds-${session?.userId}`);
};

export const revalidateAll = async () => {
	revalidatePath('/agencies', 'page');
	revalidatePath('/news-sites');
};

export const getGuild = async (id: string) => {
	const authorized = await isAuthorizedForGuild(id);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	return prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(id),
		},
	});
};

export const enableGuild = async (id: string) => {
	const authorized = await isAuthorizedForGuild(id);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	await prisma.enabled_guilds.upsert({
		where: {
			guild_id: BigInt(id),
		},
		create: {
			guild_id: BigInt(id),
		},
		update: {},
	});
};
