import prisma from '@lib/prisma';
import Client from './client';
import { getGuildChannels } from '@lib/discord-api';

export default async function Agencies({
	searchParams,
}: {
	searchParams: {
		g: string | undefined;
	};
}) {
	const guildId = searchParams?.g;
	if (!guildId) return null;

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (!guild) return null;

	const channels = await getGuildChannels(guildId);

	return <Client guild={guild} channels={channels} />;
}
