'use server';

import prisma from '@lib/prisma';
import { NewsSite, NewsSitesSettings } from '@app/(dashboard)/news/client';
import { createWebhook } from '@lib/discord-api';
import { REST } from '@discordjs/rest';
import env from '@env';
import { Routes } from 'discord-api-types/v10';
import { revalidatePath } from 'next/cache';

import { isAuthorizedForGuild } from '@lib/server-utils';

const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);

export async function updateSettings(guildId: string, settings: NewsSitesSettings): Promise<void> {
  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) {
    throw new Error('Unauthorized');
  }

  await prisma.enabled_guilds.update({
    where: {
      guild_id: BigInt(guildId),
    },
    data: {
      news_include_exclude: Number(settings.whitelist),
    },
  });
}

export const updateChannel = async (guildId: string, channelId: string): Promise<void | string> => {
  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) {
    throw new Error('Unauthorized');
  }

  const [newWebhookURL, guild] = await Promise.all([
    createWebhook(channelId, 'News'),
    prisma.enabled_guilds.findFirst({
      where: {
        guild_id: BigInt(guildId),
      },
    }),
  ]);

  if (!newWebhookURL) {
    return 'Missing permission: Manage Webhooks';
  }

  await prisma.enabled_guilds.update({
    where: {
      guild_id: BigInt(guildId),
    },
    data: {
      news_channel_id: BigInt(channelId),
      news_webhook_url: newWebhookURL,
    },
  });

  if (guild?.news_webhook_url) {
    await rest
      .delete(Routes.webhook(guild.news_webhook_url.split('/')[5]))
      // cleanup on error
      .catch(async e => {
        await prisma.enabled_guilds.update({
          where: {
            guild_id: BigInt(guildId),
          },
          data: {
            news_channel_id: null,
            news_webhook_url: null,
          },
        });
        await rest.delete(Routes.webhook(newWebhookURL.split('/')[5]));

        revalidatePath(`/news?g=${guildId}`);
        throw e;
      });
  } else {
    revalidatePath(`/news?g=${guildId}`);
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
      news_webhook_url: true,
    },
  });

  if (resp?.news_webhook_url) {
    await rest.delete(Routes.webhook(resp.news_webhook_url.split('/')[5])).catch(e => {
      console.error(e);
    });
  }

  await prisma.enabled_guilds.update({
    where: {
      guild_id: BigInt(guildId),
    },
    data: {
      news_channel_id: null,
      news_webhook_url: null,
    },
  });

  revalidatePath(`/news?g=${guildId}`);
};

export const setNewsSites = async (newsSites: NewsSite[], guildId: string) => {
  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) {
    throw new Error('Unauthorized');
  }

  if (!authorized) {
    console.error('Guild not found', {
      guildId,
    });
    throw new Error('Guild not found');
  }

  return Promise.all([
    prisma.news_filter.deleteMany({
      where: {
        guild_id: BigInt(guildId),
        news_site_id: {
          in: newsSites.filter(n => !n.selected).map(n => n.news_site_id),
        },
      },
    }),
    prisma.news_filter.createMany({
      data: newsSites
        .filter(n => n.selected)
        .map(n => ({
          guild_id: BigInt(guildId),
          news_site_id: n.news_site_id,
        })),
      skipDuplicates: true,
    }),
  ]);
};
