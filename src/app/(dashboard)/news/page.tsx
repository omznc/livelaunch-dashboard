import prisma from '@lib/prisma';
import { unstable_cache as cache } from 'next/cache';
import Client from '@app/(dashboard)/news/client';
import { getGuildChannels } from '@lib/discord-api';
import { isAuthorizedForGuild } from '@lib/server-utils';
import NotEnabled from '@app/(dashboard)/components/not-enabled';

export default async function NewsSites({
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

	const newsSites = await cache(
		async () => prisma.news_sites.findMany(),
		['news-sites'],
		{
			tags: ['news-sites'],
			revalidate: 60 * 60,
		}
	)();

	const [enabledNewsSites, channels] = await Promise.all([
		prisma.news_filter.findMany({
			where: {
				guild_id: BigInt(guildId),
			},
		}),
		getGuildChannels(guildId),
	]);

	return (
		<Client
			newsSites={newsSites}
			enabledNewsSites={enabledNewsSites}
			guild={guild}
			channels={channels}
			key={guildId}
		/>
	);
}
