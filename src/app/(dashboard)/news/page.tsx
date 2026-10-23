import Client from "@app/(dashboard)/news/client";
import { getGuildChannels } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";

// Only the bot writes this list, so no action invalidates the tag.
async function getNewsSites() {
	"use cache";
	cacheLife("hours");
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

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: { guild_id: true, news_channel_id: true, news_include_exclude: true },
	});

	if (!guild) return <NotEnabled />;

	const newsSites = await getNewsSites();

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
