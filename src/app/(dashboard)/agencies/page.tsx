import Client from "@app/(dashboard)/agencies/client";
import { prisma } from "@lib/prisma";
import { checkGuildPermissions } from "@lib/server-utils";
import { unstable_cache as cache } from "next/dist/server/web/spec-extension/unstable-cache";
import NotEnabled from "@/src/app/(dashboard)/_components/not-enabled";

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
		return null;
	}

	const agencies = await cache(async () => prisma.ll2_agencies.findMany(), ["agencies"], {
		tags: ["agencies"],
		revalidate: 60 * 60,
	})();

	const guild = await prisma.enabled_guilds.findFirst({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	if (!guild) return <NotEnabled />;

	const enabledAgencies = await prisma.ll2_agencies_filter.findMany({
		where: {
			guild_id: BigInt(guildId),
		},
	});

	return <Client agencies={agencies} enabledAgencies={enabledAgencies} guild={guild} key={guildId} />;
}
