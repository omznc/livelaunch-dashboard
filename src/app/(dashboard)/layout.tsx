import env from "@env";
import { getGuildsWithBotAccess } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { getSession } from "@lib/session";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import GuildSwitcher from "@/src/app/(dashboard)/_components/guild-switcher";
import { HeaderSkeleton } from "@/src/app/(dashboard)/_components/header-skeleton";
import { Navigation } from "@/src/app/(dashboard)/_components/navigation";
import SectionError from "@/src/app/(dashboard)/_components/section-error";
import User from "@/src/app/(dashboard)/_components/user";

// The session and guild reads are per request, so they stream behind a Suspense boundary.
export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen w-full flex-col">
			<Suspense fallback={<HeaderSkeleton />}>
				<Header />
			</Suspense>
			<main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col border-line min-[1180px]:border-x">
				<SectionError>{children}</SectionError>
			</main>
		</div>
	);
}

async function Header() {
	const session = await getSession();
	if (!session) {
		redirect("/login");
	}

	const guilds = await getGuildsWithBotAccess();
	const enabledGuilds = await prisma.enabled_guilds.findMany({
		select: { guild_id: true },
		where: {
			guild_id: {
				in: guilds.map((guild) => BigInt(guild.id)),
			},
		},
	});

	return (
		<header className="material sticky top-0 z-50 border-b border-line">
			<div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-stretch min-[1180px]:border-x min-[1180px]:border-line md:flex-nowrap">
				<div className="flex h-14 min-w-0 flex-1 md:w-[280px] md:flex-none">
					<GuildSwitcher
						guilds={guilds}
						clientId={env.DISCORD_CLIENT_ID}
						listenForInviteEvent
						className="w-full"
					/>
				</div>
				<div className="flex h-14 w-14 border-line border-l min-[1100px]:w-[280px] md:order-last">
					<User />
				</div>
				<Navigation
					className="order-last h-12 w-full border-line border-t md:order-none md:h-14 md:flex-1 md:border-t-0 md:border-l"
					guilds={enabledGuilds}
					allGuilds={guilds}
				/>
			</div>
		</header>
	);
}

export interface GuildsResponse extends RESTAPIPartialCurrentUserGuild {
	botAccess: boolean;
}
