import 'server-only';

import { getUserGuilds, checkBotPermissions } from '@lib/discord-api';
import { auth } from '@lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function isAuthorizedForGuild(guildId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return false;

  const guilds = await getUserGuilds();
  return guilds.find(g => g.id === guildId);
}

export async function checkGuildPermissions(guildId: string) {
  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) return null;

  const permissionCheck = await checkBotPermissions(guildId);
  if (!permissionCheck.hasAll) {
    redirect(`/almost-there?g=${guildId}`);
  }

  return authorized;
}

export async function isAuthorized() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session || !session?.user) return false;
  return { session: session.session, user: session.user };
}
