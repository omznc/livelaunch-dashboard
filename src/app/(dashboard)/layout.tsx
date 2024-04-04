import GuildSwitcher from '@app/(dashboard)/components/guild-switcher';
import {Nav} from '@app/(dashboard)/components/nav';
import {ThemeToggle} from '@components/theme-toggle';
import User from '@app/(dashboard)/components/user';
import {RESTAPIPartialCurrentUserGuild} from 'discord.js';
import {ReactNode} from 'react';
import {getBotGuilds, getUserGuilds} from '@lib/discord-api';
import prisma from '@lib/prisma';
import {isAuthorized} from "@lib/server-utils";

export default async function Layout({children}: { children: ReactNode }) {
	await isAuthorized();

	const guilds = await filterGuilds();
	const enabledGuilds = await prisma.enabled_guilds.findMany({
		where: {
			guild_id: {
				in: guilds.map(guild => BigInt(guild.id)),
			},
		},
	});

	return (
		<div className='flex flex-col items-center min-h-screen h-full max-h-screen w-full'>
			<div className='sticky top-0 w-full bg-background z-50'>
				<div className='hidden flex-row w-full justify-between border-b md:flex'>
					<div className='flex h-16 items-center px-4'>
						<GuildSwitcher guilds={guilds}/>
						<Nav className='md:mx-6' guilds={enabledGuilds}/>
					</div>
					<div className='flex h-16 items-center gap-4 px-4'>
						<ThemeToggle/>
						<User/>
					</div>
				</div>
				<div className='flex w-full flex-col md:hidden md:gap-4'>
					<div className='flex h-16 items-center gap-2 justify-between px-4'>
						<div className='flex items-center'>
							<GuildSwitcher guilds={guilds}/>
						</div>
						<div className='flex items-center gap-2'>
							<ThemeToggle/>
							<User/>
						</div>
					</div>
					<Nav className='md:mx-6' guilds={enabledGuilds}/>
				</div>
			</div>
			<div className='w-full flex p-8 justify-center'>
				<div className='w-full max-w-[1200px] flex flex-col gap-8'>
					{children}
				</div>
			</div>
		</div>
	);
}

export interface GuildsResponse extends RESTAPIPartialCurrentUserGuild {
	botAccess: boolean;
}

const filterGuilds = async () => {
	const [userGuilds, botGuilds] = await Promise.all([
		getUserGuilds(),
		getBotGuilds(),
	]);

	if (!Array.isArray(userGuilds) || !Array.isArray(botGuilds)) {
		return [];
	}

	// Filter and map the guilds
	const guilds: GuildsResponse[] = botGuilds
		.filter(guild =>
			userGuilds.some(userGuild => userGuild.id === guild.id)
		)
		.map(guild => ({...guild, botAccess: true}));

	return guilds;
};
