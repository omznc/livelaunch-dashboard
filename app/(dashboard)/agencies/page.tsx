import prisma from '@lib/prisma';
import { unstable_cache as cache } from 'next/dist/server/web/spec-extension/unstable-cache';
import Client from '@app/(dashboard)/agencies/client';

export default async function Agencies({
	searchParams,
}: {
	searchParams: {
		g: string | undefined;
	};
}) {
	const guild = searchParams?.g;

	if (!guild) return null;

	const agencies = await cache(
		async () => prisma.ll2_agencies.findMany(),
		['agencies'],
		{
			tags: ['agencies'],
			revalidate: 60 * 60,
		}
	)();

	const enabledAgencies = await prisma.ll2_agencies_filter.findMany({
		where: {
			guild_id: BigInt(guild),
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
