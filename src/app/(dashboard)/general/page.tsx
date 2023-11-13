import prisma from '@lib/prisma';
import Client from './client';
import { getGuildChannels } from '@lib/discord-api';
import { isAuthorized } from '@lib/server-utils';
import NotEnabled from '@app/(dashboard)/components/not-enabled';

export default async function Agencies({
	searchParams,
}: {
	searchParams: {
		g: string | undefined;
	};
}) {
	const guildId = searchParams?.g;
	if (!guildId) return null;

	const authorized = await isAuthorized(guildId);
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
