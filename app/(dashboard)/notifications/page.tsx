import prisma from '@lib/prisma';
import Client from './client';
import { getBotChannels } from '@lib/discord-api';

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

	const [countdowns, channels] = await Promise.all([
		prisma.notification_countdown.findMany({
			where: {
				guild_id: BigInt(guildId),
			},
		}),
		getBotChannels(guildId),
	]);

	return <Client guild={guild} countdowns={countdowns} channels={channels} />;
}
