import prisma from '@lib/prisma';
import Client from './client';
import { getGuildChannels } from '@lib/discord-api';
import { isAuthorized } from '@lib/server-utils';

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

	if (!guild) return null;

	const [countdowns, channels] = await Promise.all([
		prisma.notification_countdown.findMany({
			where: {
				guild_id: BigInt(guildId),
			},
		}),
		getGuildChannels(guildId),
	]);

	return (
		<Client
			guild={guild}
			countdowns={countdowns}
			channels={channels}
			key={guildId}
		/>
	);
}
