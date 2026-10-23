import env from "@env";
import { getBotGuilds, getUserGuilds } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import GuildSwitcher from "@/src/app/(dashboard)/_components/guild-switcher";
import { Navigation } from "@/src/app/(dashboard)/_components/navigation";
import SectionError from "@/src/app/(dashboard)/_components/section-error";
import User from "@/src/app/(dashboard)/_components/user";
import { auth } from "@/src/lib/auth";

// The session and guild reads are per request, so they stream behind a Suspense boundary.
export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen w-full flex-col">
			{/* Same height as the real header, so nothing jumps when it streams in. */}
			<Suspense
				fallback={<div className="material sticky top-0 z-50 h-[97px] border-b border-line md:h-[53px]" />}
			>
				<Header />
			</Suspense>
			<main className="mx-auto w-full max-w-[1180px] flex-1 border-line px-4 py-8 sm:px-6 sm:py-10 min-[1180px]:border-x">
				<SectionError>{children}</SectionError>
			</main>
		</div>
	);
}

async function Header() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect("/login");
	}

	const guilds = await filterGuilds();
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
				<div className="flex h-[52px] min-w-0 flex-1 items-center px-4 md:flex-none">
					<GuildSwitcher
						guilds={guilds}
						clientId={env.DISCORD_CLIENT_ID}
						listenForInviteEvent
						className="max-w-full"
					/>
				</div>
				<div className="flex h-[52px] items-center px-4 md:order-last">
					<User />
				</div>
				<Navigation
					className="order-last h-11 w-full border-line border-t px-4 md:order-none md:h-[52px] md:flex-1 md:border-t-0 md:border-l"
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

const filterGuilds = async () => {
	const [userGuilds, botGuilds] = await Promise.all([getUserGuilds(), getBotGuilds()]);

	if (!Array.isArray(userGuilds)) {
		return [];
	}

	if (!Array.isArray(botGuilds)) {
		return userGuilds.map((guild) => ({ ...guild, botAccess: false }));
	}

	// Map all user guilds and mark bot access
	const guilds: GuildsResponse[] = userGuilds.map((guild) => ({
		...guild,
		botAccess: botGuilds.some((botGuild) => botGuild.id === guild.id),
	}));

	return guilds;
};
