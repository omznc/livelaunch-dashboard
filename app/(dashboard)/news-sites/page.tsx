import prisma from '@lib/prisma';
import { unstable_cache as cache } from 'next/cache';
import Client from '@app/(dashboard)/news-sites/client';

export default async function NewsSites({
											searchParams,
										}: {
	searchParams: {
		g: string | undefined;
	};
}) {
	const guildId = searchParams?.g;
	if (!guildId) return null;

	// const newsSites = await prisma.news_sites.findMany();
	const newsSites = await cache(
		async () => prisma.news_sites.findMany(),
		['news-sites'],
		{
			tags: ['news-sites'],
			revalidate: 60 * 60,
		},
	)();

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (!guild) return null;

	const enabledNewsSites = await prisma.news_filter.findMany({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	return (
		<Client
			newsSites={newsSites}
			enabledNewsSites={enabledNewsSites}
			guild={guild}
		/>
	);
}
