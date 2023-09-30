import prisma from '@lib/prisma';
import { unstable_cache as cache } from 'next/dist/server/web/spec-extension/unstable-cache';
import Client from '@app/(dashboard)/agencies/client';
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

	const agencies = await cache(
		async () => prisma.ll2_agencies.findMany(),
		['agencies'],
		{
			tags: ['agencies'],
			revalidate: 60 * 60,
		}
	)();

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (!guild) return null;

	const enabledAgencies = await prisma.ll2_agencies_filter.findMany({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	return (
		<Client
			agencies={agencies}
			enabledAgencies={enabledAgencies}
			guild={guild}
		/>
	);
}
