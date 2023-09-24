import prisma from '@lib/prisma';
import Client from './client';

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

	return <Client guild={guild} />;
}
