import Client from "@app/(dashboard)/agencies/client";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";

// Only the bot writes this list, so no action invalidates the tag.
async function getAgencies() {
	"use cache";
	cacheLife("hours");
	cacheTag("agencies");
	return prisma.ll2_agencies.findMany();
}

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

	const agencies = await getAgencies();

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
		select: { guild_id: true, agencies_include_exclude: true },
	});

	if (!guild) return <NotEnabled />;

	const enabledAgencies = await prisma.ll2_agencies_filter.findMany({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	return <Client agencies={agencies} enabledAgencies={enabledAgencies} guild={guild} key={guildId} />;
}
