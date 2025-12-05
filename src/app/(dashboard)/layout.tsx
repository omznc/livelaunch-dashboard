import { getBotGuilds, getUserGuilds } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import type { RESTAPIPartialCurrentUserGuild } from "discord.js";
import type { ReactNode } from "react";
import GuildSwitcher from "@/src/app/(dashboard)/_components/guild-switcher";
import { Nav } from "@/src/app/(dashboard)/_components/nav";
import User from "@/src/app/(dashboard)/_components/user";

export default async function Layout({ children }: { children: ReactNode }) {
	const guilds = await filterGuilds();
	const enabledGuilds = await prisma.enabled_guilds.findMany({
		where: {
			guild_id: {
				in: guilds.map((guild) => BigInt(guild.id)),
			},
		},
	});

	return (
		<div className="flex min-h-screen w-full flex-col items-center">
			<div className="sticky top-0 z-50 w-full bg-primary/20 backdrop-blur-sm">
				<div className="hidden w-full flex-row justify-between border-b md:flex">
					<div className="flex h-16 items-center px-4">
						<GuildSwitcher guilds={guilds} listenForInviteEvent />
						<Nav className="md:mx-6" guilds={enabledGuilds} allGuilds={guilds} />
					</div>
					<div className="flex h-16 items-center gap-4 px-4">
						<User />
					</div>
				</div>
				<div className="flex w-full flex-col md:hidden md:gap-4">
					<div className="flex h-16 items-center justify-between gap-2 px-4">
						<div className="flex items-center">
							<GuildSwitcher guilds={guilds} />
						</div>
						<div className="flex items-center gap-2">
							<User />
						</div>
					</div>
					<Nav className="md:mx-6" guilds={enabledGuilds} allGuilds={guilds} />
				</div>
			</div>
			<div className="flex w-full justify-center p-4 md:p-8">
				<div className="flex w-full max-w-[1200px] flex-col gap-8 py-12">{children}</div>
			</div>
		</div>
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
