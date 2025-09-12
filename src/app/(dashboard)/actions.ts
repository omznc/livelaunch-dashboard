'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@lib/prisma';
import { isAuthorizedForGuild } from '@lib/server-utils';
import { auth } from '@lib/auth';
import { headers } from 'next/headers';

export const revalidateGuilds = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session || !session?.user) return;

  revalidateTag('get-bot-guilds');
  revalidateTag(`get-user-guilds-${session.user.id}`);
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
