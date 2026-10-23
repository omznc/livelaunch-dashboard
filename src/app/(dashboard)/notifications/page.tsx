import { getGuildChannels } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
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
			notification_channel_id: true,
			notification_end_status: true,
			notification_deploy: true,
			notification_hold: true,
			notification_go: true,
			notification_liftoff: true,
			notification_tbc: true,
			notification_tbd: true,
			notification_t0_change: true,
			notification_launch: true,
			notification_event: true,
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

	return <Client guild={guild} countdowns={countdowns} channels={channels} key={guildId} />;
}
