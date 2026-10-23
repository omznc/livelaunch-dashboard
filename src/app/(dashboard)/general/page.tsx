import { getGuildChannels } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
import { notFound } from "next/navigation";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";
import Client from "./client";

export const dynamic = "force-dynamic";

export default async function Agencies(props: {
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
	});

	if (!guild) return <NotEnabled />;

	const channels = await getGuildChannels(guildId);

	return <Client guild={guild} channels={channels} key={guildId} />;
}
