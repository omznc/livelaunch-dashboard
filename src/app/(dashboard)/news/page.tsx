import Client from "@app/(dashboard)/news/client";
import { getDisplayChannels } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";

// Only the bot writes this list, so no action invalidates the tag.
async function getNewsSites() {
	"use cache";
	cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
	cacheTag("news-sites");
	return prisma.news_sites.findMany();
}

export default async function NewsSites(props: {
	searchParams: Promise<{
		g: string | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const guildId = searchParams?.g;
	if (!guildId) return null;

	const authorized = await checkGuildPermissions(guildId);
	if (!authorized) {
		notFound();
	}

	const [guild, newsSites, enabledNewsSites, channels] = await Promise.all([
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: { guild_id: true, news_channel_id: true, news_include_exclude: true },
		}),
		getNewsSites(),
		prisma.news_filter.findMany({
			where: {
				guild_id: BigInt(guildId),
			},
			select: { news_site_id: true },
		}),
		getDisplayChannels(guildId),
	]);

	if (!guild) return <NotEnabled />;

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
