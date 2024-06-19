import prisma from '@lib/prisma';
import Client from './client';
import { getGuildChannels } from '@lib/discord-api';
import { isAuthorizedForGuild } from '@lib/server-utils';
import { redirect } from 'next/navigation';
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

	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) {
		return null;
	}

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (!guild) return <NotEnabled />;

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
