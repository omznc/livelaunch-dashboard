import 'server-only';

import type {
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPIGuildChannelsResult,
  RESTPostAPIChannelWebhookResult,
} from 'discord.js';
import env from '@env';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import avatar from '@public/LiveLaunch_Webhook_Avatar.png';
import { isAuthorized } from '@lib/server-utils';
import { auth } from '@lib/auth';
import { headers } from 'next/headers';

const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);

/**
 * Gets the channels the bot can send messages in
 */
export const getGuildChannels = async (guildId: string) => {
  const resp = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: {
      authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    next: {
      revalidate: 60 * 5,
      tags: [`get-guild-channels-${guildId}`],
    },
  }).then(resp => resp.json());

  if (!resp || !Array.isArray(resp)) {
    console.debug('getGuildChannels received non-array', {
      resp,
    });
    return [];
  }

  return resp
    .filter(channel => channel.type === 0 || channel.type === 5)
    .sort((a, b) => a.position - b.position) as RESTGetAPIGuildChannelsResult;
};

/**
 * Gets the guilds the bot is in
 */
export const getBotGuilds = async () => {
  let allGuilds: any[] = [];
  let lastId: string | undefined;

  // Keep fetching until we have all guilds
  while (true) {
    const url = new URL('https://discord.com/api/users/@me/guilds');
    url.searchParams.append('limit', '200');
    if (lastId) {
      url.searchParams.append('after', lastId);
    }

    const response = await fetch(url.toString(), {
      headers: { authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
      next: {
        revalidate: 60,
        tags: ['get-bot-guilds'],
      },
    });

    const resp = await response.json();

    if (!response.ok) {
      if (response.status === 429 && resp.retry_after) {
        console.log(`Rate limited, waiting ${resp.retry_after * 1000}ms`);
        await new Promise(resolve => setTimeout(resolve, resp.retry_after * 1000));
        continue;
      }
      console.debug('getBotGuilds API error', {
        status: response.status,
        resp,
      });
      return allGuilds;
    }

    if (!resp || !Array.isArray(resp)) {
      console.debug('getBotGuilds received non-array', {
        resp,
      });
      return allGuilds;
    }

    if (resp.length === 0) {
      break; // No more results
    }

    allGuilds = [...allGuilds, ...resp];

    // If we got fewer than 200 guilds, we've reached the end
    if (resp.length < 200) {
      break;
    }

    // Get ID of the last guild for the next page
    lastId = resp[resp.length - 1].id;
  }

  return allGuilds as RESTAPIPartialCurrentUserGuild[];
};

/**
 * Gets the guilds the user is in
 */
export const getUserGuilds = async () => {
  const data = await isAuthorized();
  if (!data) return [];
  const { user } = data;

  const { accessToken } = await auth.api.getAccessToken({
    headers: await headers(),
    body: {
      providerId: 'discord',
    },
  });

  const resp = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { authorization: `Bearer ${accessToken}` },
    next: {
      revalidate: 60 * 5,
      tags: [`get-user-guilds-${user.id}`],
    },
  }).then(resp => resp.json());

  if (!resp || !Array.isArray(resp)) return [];

  return resp.filter(guild => (parseInt(guild.permissions) & 0x8) === 0x8) as RESTAPIPartialCurrentUserGuild[];
};

/**
 * Creates a webhook in the specified channel
 * @param channelId Channel ID
 * @param category Category name
 */
export const createWebhook = async (channelId: string, category: string) => {
  const resp = await fetch(`${env.PUBLIC_URL}${avatar.src}`);
  const webhook = await rest
    .post(Routes.channelWebhooks(channelId), {
      body: {
        name: `LiveLaunch ${category}`,
        avatar: `data:image/png;base64,${Buffer.from(await resp.arrayBuffer()).toString('base64')}`,
      },
    })
    .then(r => r as RESTPostAPIChannelWebhookResult)
    .catch(() => {
      return null;
    });

  return webhook ? (webhook.url as string) : null;
};

/**
 * Gets the bot's permissions in a guild
 */
export const getBotPermissions = async (guildId: string): Promise<string | null> => {
  // First, let's try to get the guild and find the bot's member info
  const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'User-Agent': 'LiveLaunch (https://github.com/omznc/livelaunch-dashboard, 1.0.0)',
    },
    next: {
      revalidate: 15,
      tags: [`get-guild-${guildId}`],
    },
  });

  if (!guildResponse.ok) {
    console.log('Error getting guild:', guildResponse.status, guildResponse.statusText);
    try {
      const errorBody = await guildResponse.text();
      console.log('Guild error body:', errorBody);
    } catch (e) {
      console.log('Could not read guild error body');
    }
    return null;
  }

  const guild = await guildResponse.json();
  console.log('Guild data:', guild.name);

  // Get bot's application info to find its user ID
  const appResponse = await fetch(`https://discord.com/api/v10/oauth2/applications/@me`, {
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'User-Agent': 'LiveLaunch (https://github.com/omznc/livelaunch-dashboard, 1.0.0)',
    },
  });

  if (!appResponse.ok) {
    console.log('Error getting app info:', appResponse.status);
    return null;
  }

  const app = await appResponse.json();
  const botUserId = app.bot.id;
  console.log('Bot user ID:', botUserId);

  // Now get the bot's member info using its user ID
  const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botUserId}`, {
    headers: {
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      'User-Agent': 'LiveLaunch (https://github.com/omznc/livelaunch-dashboard, 1.0.0)',
    },
    next: {
      revalidate: 15,
      tags: [`get-bot-member-${guildId}`],
    },
  });

  if (!memberResponse.ok) {
    console.log('Error getting bot member:', memberResponse.status, memberResponse.statusText);
    try {
      const errorBody = await memberResponse.text();
      console.log('Member error body:', errorBody);
    } catch (e) {
      console.log('Could not read member error body');
    }

    if (memberResponse.status === 429) {
      const resp = await memberResponse.json();
      if (resp.retry_after) {
        console.log(`Rate limited, waiting ${resp.retry_after * 1000}ms`);
        await new Promise(resolve => setTimeout(resolve, resp.retry_after * 1000));
        return getBotPermissions(guildId);
      }
    }
    return null;
  }

  const member = await memberResponse.json();

  let permissions = BigInt(guild.roles.find((r: any) => r.id === guildId)?.permissions || '0');

  for (const roleId of member.roles) {
    const role = guild.roles.find((r: any) => r.id === roleId);
    if (role) {
      console.log(`Role ${role.name} (${role.id}): ${role.permissions}`);
      permissions |= BigInt(role.permissions);
    }
  }

  return permissions.toString();
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
        { name: 'Manage Events', description: 'Required to create Discord scheduled events', hasPermission: false },
        { name: 'Send Messages', description: 'Required to send messages to channels', hasPermission: false },
        { name: 'Embed Links', description: 'Required to send rich embeds with links', hasPermission: false },
      ],
    };
  }

  const permissionBits = BigInt(permissions);

  // Administrator permission grants all permissions
  const ADMINISTRATOR = BigInt(0x8);
  const hasAdministrator = (permissionBits & ADMINISTRATOR) === ADMINISTRATOR;

  const MANAGE_WEBHOOKS = BigInt(0x20000000);
  const MANAGE_EVENTS = BigInt(0x8000000000);
  const SEND_MESSAGES = BigInt(0x800);
  const EMBED_LINKS = BigInt(0x4000);

  const permissionChecks: PermissionStatus[] = [
    {
      name: 'Manage Webhooks',
      description: 'Required to create webhooks for messages',
      hasPermission: hasAdministrator || (permissionBits & MANAGE_WEBHOOKS) === MANAGE_WEBHOOKS,
    },
    {
      name: 'Manage Events',
      description: 'Required to create Discord scheduled events',
      hasPermission: hasAdministrator || (permissionBits & MANAGE_EVENTS) === MANAGE_EVENTS,
    },
    {
      name: 'Send Messages',
      description: 'Required to send messages to channels',
      hasPermission: hasAdministrator || (permissionBits & SEND_MESSAGES) === SEND_MESSAGES,
    },
    {
      name: 'Embed Links',
      description: 'Required to send rich embeds with links',
      hasPermission: hasAdministrator || (permissionBits & EMBED_LINKS) === EMBED_LINKS,
    },
  ];

  const hasAll = permissionChecks.every(p => p.hasPermission);

  return {
    hasAll,
    permissions: permissionChecks,
  };
};
