import { checkBotPermissions } from '@lib/discord-api';
import { isAuthorizedForGuild } from '@lib/server-utils';
import { redirect } from 'next/navigation';
import Client from './client';

export default async function AlmostThere(props: {
  searchParams: Promise<{
    g: string | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;
  const guildId = searchParams?.g;

  if (!guildId) {
    redirect('/');
  }

  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) {
    redirect('/');
  }

  const permissionCheck = await checkBotPermissions(guildId);
  if (permissionCheck.hasAll) {
    redirect(`/?g=${guildId}`);
  }

  return <Client guildName={authorized.name} permissions={permissionCheck.permissions} />;
}
