import prisma from '@lib/prisma';
import Client from './client';
import { getGuildChannels } from '@lib/discord-api';
import { checkGuildPermissions } from '@lib/server-utils';
import NotEnabled from '@/src/app/(dashboard)/_components/not-enabled';

export const dynamic = 'force-dynamic';

export default async function Agencies(props: {
  searchParams: Promise<{
    g: string | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;
  const guildId = searchParams?.g;
  if (!guildId) return null;

  const authorized = await checkGuildPermissions(guildId);
  if (!authorized) {
    return null;
  }

  const guild = await prisma.enabled_guilds.findFirst({
    where: {
      guild_id: BigInt(guildId),
    },
  });

  if (!guild) return <NotEnabled />;

  const channels = await getGuildChannels(guildId);

  return <Client guild={guild} channels={channels} key={guildId} />;
}
