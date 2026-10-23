import { getDisplayChannels } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions, redirectToDefaultGuild } from "@lib/server-utils";
import { notFound } from "next/navigation";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";
import Client from "./client";

export default async function Agencies(props: {
	searchParams: Promise<{
		g: string | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const guildId = searchParams?.g;
	if (!guildId) return redirectToDefaultGuild("/general");

	const authorized = await checkGuildPermissions(guildId);
	if (!authorized) {
		notFound();
	}

	const [guild, channels] = await Promise.all([
		prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			select: {
				guild_id: true,
				channel_id: true,
				scheduled_events: true,
				notification_button_fc: true,
				notification_button_g4l: true,
				notification_button_sln: true,
				se_launch: true,
				se_event: true,
				se_no_url: true,
			},
		}),
		getDisplayChannels(guildId),
	]);

	if (!guild) return <NotEnabled />;

	return <Client guild={guild} channels={channels} key={guildId} />;
}
