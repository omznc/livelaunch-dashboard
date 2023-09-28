import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import AuthProvider from '@components/auth-provider';
import { redirect } from 'next/navigation';
import GuildSwitcher from '@app/(dashboard)/components/guild-switcher';
import { Nav } from '@app/(dashboard)/components/nav';
import { ThemeToggle } from '@components/theme-toggle';
import User from '@app/(dashboard)/components/user';
import { RESTAPIPartialCurrentUserGuild } from 'discord.js';
import { ReactNode } from 'react';
import { getBotGuilds, getUserGuilds } from '@lib/discord-api';
import env from '@env';

export default async function Layout({ children }: { children: ReactNode }) {
	console.log(env);

	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return redirect('/login');
	}

	return (
		<AuthProvider session={session}>
			<div className='flex flex-col items-center h-[100dvh] w-full'>
				<div className='hidden flex-row w-full justify-between border-b md:flex'>
					<div className='flex h-16 items-center px-4'>
						{/*<GuildSwitcher guilds={await filterGuilds()} />*/}
						<Nav className='mx-6' />
					</div>
					<div className='flex h-16 items-center gap-4 px-4'>
						<ThemeToggle />
						<User />
					</div>
				</div>
				{/* Mobile version */}
				<div className='flex w-full flex-col md:hidden gap-4'>
					<div className='flex h-16 items-center justify-between px-4'>
						<div className='flex items-center'>
							{/*<GuildSwitcher guilds={await filterGuilds()} />*/}
						</div>
						<div className='flex items-center gap-2'>
							<ThemeToggle />
							<User />
						</div>
					</div>
					<Nav className='mx-6' />
				</div>
				<div className='w-full h-full overflow-scroll flex p-8 justify-center'>
					<div className='flex flex-col mb-8 w-full max-w-[1000px] transition-all'>
						{children}
						<div className={'min-h-[2rem]'}></div>
					</div>
				</div>
			</div>
		</AuthProvider>
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

	if (!userGuilds || !botGuilds) {
		return [];
	}
	// return the guilds the bot and user share
	const guilds: GuildsResponse[] = botGuilds
		.filter(guild =>
			userGuilds.some(userGuild => userGuild.id === guild.id)
		)
		.map(guild => ({ ...guild, botAccess: true }));

	return guilds;
};
