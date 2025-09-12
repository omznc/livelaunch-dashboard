'use server';

import prisma from '@lib/prisma';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import env from '@env';
import { createWebhook } from '@lib/discord-api';
import { revalidatePath } from 'next/cache';
import { guildActionClient, guildIdSchema } from '@lib/safe-actions';
import { z } from 'zod';

const rest = new REST({ version: '9' }).setToken(env.DISCORD_BOT_TOKEN);

const generalSettingsSchema = z.object({
  guildId: z.string(),
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const updateSettings = guildActionClient
  .inputSchema(generalSettingsSchema)
  .action(async ({ parsedInput: { guildId, settings } }) => {
    const data = Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, Number(value)]));
    await prisma.enabled_guilds.update({
      where: {
        guild_id: BigInt(guildId),
      },
      data: {
        ...data,
      },
    });
  });

const updateChannelSchema = z.object({
  guildId: z.string(),
  channelId: z.string(),
});

export const updateChannel = guildActionClient
  .inputSchema(updateChannelSchema)
  .action(async ({ parsedInput: { guildId, channelId } }) => {
    const [newWebhookURL, guild] = await Promise.all([
      createWebhook(channelId, 'Messages'),
      prisma.enabled_guilds.findFirst({
        where: {
          guild_id: BigInt(guildId),
        },
      }),
    ]);

    if (!newWebhookURL) {
      return { error: 'Missing permission: Manage Webhooks' };
    }

    await prisma.enabled_guilds.update({
      where: {
        guild_id: BigInt(guildId),
      },
      data: {
        channel_id: BigInt(channelId),
        webhook_url: newWebhookURL,
      },
    });

    if (guild?.webhook_url) {
      await rest.delete(Routes.webhook(guild.webhook_url.split('/')[5])).catch(async e => {
        await prisma.enabled_guilds.update({
          where: {
            guild_id: BigInt(guildId),
          },
          data: {
            channel_id: null,
            webhook_url: null,
          },
        });
        await rest.delete(Routes.webhook(newWebhookURL.split('/')[5]));

        revalidatePath(`/general?g=${guildId}`);
        throw e;
      });
    } else {
      revalidatePath(`/general?g=${guildId}`);
    }

    return { success: true };
  });

const updateNumberOfEventsSchema = z.object({
  guildId: z.string(),
  num: z.number().min(0).max(50),
});

export const updateNumberOfEvents = guildActionClient
  .inputSchema(updateNumberOfEventsSchema)
  .action(async ({ parsedInput: { guildId, num } }) => {
    await prisma.enabled_guilds.update({
      where: {
        guild_id: BigInt(guildId),
      },
      data: {
        scheduled_events: num,
      },
    });

    revalidatePath(`/general?g=${guildId}`);
  });

export const disableFeature = guildActionClient
  .inputSchema(guildIdSchema)
  .action(async ({ parsedInput: { guildId }, ctx }) => {
    const resp = await prisma.enabled_guilds.findFirst({
      where: {
        guild_id: BigInt(guildId),
      },
      select: {
        webhook_url: true,
      },
    });

    if (resp?.webhook_url) {
      await rest.delete(Routes.webhook(resp.webhook_url.split('/')[5])).catch(e => {
        console.error(e);
      });
    }

    await prisma.enabled_guilds.update({
      where: {
        guild_id: BigInt(guildId),
      },
      data: {
        channel_id: null,
        webhook_url: null,
      },
    });

    revalidatePath(`/general?g=${guildId}`);
  });
