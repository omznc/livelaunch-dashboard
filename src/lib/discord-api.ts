import 'server-only';

import type {
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPIGuildChannelsResult,
  RESTPostAPIChannelWebhookResult,
  APIGuild,
  APIApplication,
  APIGuildMember,
} from 'discord.js';
import env from '@env';
import { REST } from '@discordjs/rest';
import { Routes, PermissionFlagsBits } from 'discord-api-types/v10';
import avatar from '@public/LiveLaunch_Webhook_Avatar.png';
import { isAuthorized } from '@lib/server-utils';
import { auth } from '@lib/auth';
import { headers } from 'next/headers';
import { logger } from '@lib/logger';

const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);

const handleRateLimit = async (response: Response) => {
  if (response.status === 429) {
    const data = await response.json();
    if (data.retry_after) {
      logger.warn('discord-api', `Rate limited, waiting ${data.retry_after * 1000}ms`);
      await new Promise(resolve => setTimeout(resolve, data.retry_after * 1000));
      return true;
    }
  }
  return false;
};

/**
 * Gets the channels the bot can send messages in
 */
export const getGuildChannels = async (guildId: string): Promise<RESTGetAPIGuildChannelsResult> => {
  try {
    const channels = (await rest.get(Routes.guildChannels(guildId))) as RESTGetAPIGuildChannelsResult;

    return channels.filter(channel => channel.type === 0 || channel.type === 5).sort((a, b) => a.position - b.position);
  } catch (error) {
    logger.debug('discord-api:getGuildChannels', 'Failed to get guild channels', { guildId, error });
    return [];
  }
};

/**
 * Gets the guilds the bot is in
 */
export const getBotGuilds = async (): Promise<RESTAPIPartialCurrentUserGuild[]> => {
  try {
    const guilds = (await rest.get(Routes.userGuilds())) as RESTAPIPartialCurrentUserGuild[];
    return guilds;
  } catch (error) {
    logger.debug('discord-api:getBotGuilds', 'Failed to get bot guilds', { error });
    return [];
  }
};

/**
 * Gets the guilds the user is in
 */
export const getUserGuilds = async (): Promise<RESTAPIPartialCurrentUserGuild[]> => {
  try {
    const data = await isAuthorized();
    if (!data) return [];
    const { user } = data;

    const { accessToken } = await auth.api.getAccessToken({
      headers: await headers(),
      body: {
        providerId: 'discord',
      },
    });

    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { authorization: `Bearer ${accessToken}` },
      next: {
        revalidate: 60 * 5,
        tags: [`get-user-guilds-${user.id}`],
      },
    });

    if (!response.ok) {
      if (await handleRateLimit(response)) {
        return getUserGuilds();
      }
      logger.debug('discord-api:getUserGuilds', 'API error when getting user guilds', { status: response.status });
      return [];
    }

    const guilds = await response.json();
    if (!Array.isArray(guilds)) return [];

    return guilds.filter(
      guild => (BigInt(guild.permissions) & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator
    ) as RESTAPIPartialCurrentUserGuild[];
  } catch (error) {
    logger.debug('discord-api:getUserGuilds', 'Failed to get user guilds', { error });
    return [];
  }
};

/**
 * Creates a webhook in the specified channel
 * @param channelId Channel ID
 * @param category Category name
 */
export const createWebhook = async (channelId: string, category: string): Promise<string | null> => {
  try {
    const avatarResponse = await fetch(`${env.PUBLIC_URL}${avatar.src}`);
    if (!avatarResponse.ok) {
      throw new Error(`Failed to fetch avatar: ${avatarResponse.status}`);
    }

    const webhook = (await rest.post(Routes.channelWebhooks(channelId), {
      body: {
        name: `LiveLaunch ${category}`,
        avatar: `data:image/png;base64,${Buffer.from(await avatarResponse.arrayBuffer()).toString('base64')}`,
      },
    })) as RESTPostAPIChannelWebhookResult;

    return webhook.url ?? null;
  } catch (error) {
    logger.debug('discord-api:createWebhook', 'Failed to create webhook', { channelId, category, error });
    return null;
  }
};

/**
 * Gets the bot's permissions in a guild
 */
export const getBotPermissions = async (guildId: string): Promise<string | null> => {
  try {
    const [guild, app] = await Promise.all([
      rest.get(Routes.guild(guildId)) as Promise<APIGuild>,
      rest.get(Routes.oauth2CurrentApplication()) as Promise<APIApplication>,
    ]);

    const botUserId = app.bot?.id;
    if (!botUserId) {
      logger.debug('discord-api:getBotPermissions', 'Could not get bot user ID');
      return null;
    }

    const member = (await rest.get(Routes.guildMember(guildId, botUserId))) as APIGuildMember;

    let permissions = BigInt(guild.roles.find(r => r.id === guildId)?.permissions || '0');

    for (const roleId of member.roles) {
      const role = guild.roles.find(r => r.id === roleId);
      if (role) {
        permissions |= BigInt(role.permissions);
      }
    }

    return permissions.toString();
  } catch (error) {
    logger.debug('discord-api:getBotPermissions', 'Failed to get bot permissions', { guildId, error });
    return null;
  }
};

export interface PermissionStatus {
  name: string;
  description: string;
  hasPermission: boolean;
}

export interface BotPermissionCheck {
  hasAll: boolean;
  permissions: PermissionStatus[];
}

/**
 * Checks if the bot has required permissions in a guild
 */
export const checkBotPermissions = async (guildId: string): Promise<BotPermissionCheck> => {
  const permissions = await getBotPermissions(guildId);
  if (!permissions) {
    return {
      hasAll: false,
      permissions: [
        { name: 'Manage Webhooks', description: 'Required to create webhooks for messages', hasPermission: false },
        { name: 'Manage Events', description: 'Required to edit and cancel Discord scheduled events', hasPermission: false },
        { name: 'Create Events', description: 'Required to create Discord scheduled events', hasPermission: false },
        { name: 'Send Messages', description: 'Required to send messages to channels', hasPermission: false },
        { name: 'Embed Links', description: 'Required to send rich embeds with links', hasPermission: false },
      ],
    };
  }

  const permissionBits = BigInt(permissions);

  const hasAdministrator = (permissionBits & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator;

  const permissionChecks: PermissionStatus[] = [
    {
      name: 'Manage Webhooks',
      description: 'Required to create webhooks for messages',
      hasPermission:
        hasAdministrator ||
        (permissionBits & PermissionFlagsBits.ManageWebhooks) === PermissionFlagsBits.ManageWebhooks,
    },
    {
      name: 'Manage Events',
      description: 'Required to edit and cancel Discord scheduled events',
      hasPermission:
        hasAdministrator || (permissionBits & PermissionFlagsBits.ManageEvents) === PermissionFlagsBits.ManageEvents,
    },
    {
      name: 'Create Events',
      description: 'Required to create Discord scheduled events',
      hasPermission:
        hasAdministrator || (permissionBits & PermissionFlagsBits.CreateEvents) === PermissionFlagsBits.CreateEvents,
    },
    {
      name: 'Send Messages',
      description: 'Required to send messages to channels',
      hasPermission:
        hasAdministrator || (permissionBits & PermissionFlagsBits.SendMessages) === PermissionFlagsBits.SendMessages,
    },
    {
      name: 'Embed Links',
      description: 'Required to send rich embeds with links',
      hasPermission:
        hasAdministrator || (permissionBits & PermissionFlagsBits.EmbedLinks) === PermissionFlagsBits.EmbedLinks,
    },
  ];

  const hasAll = permissionChecks.every(p => p.hasPermission);

  return {
    hasAll,
    permissions: permissionChecks,
  };
};
