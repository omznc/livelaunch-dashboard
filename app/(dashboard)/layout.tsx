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
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return redirect('/login');
	}

	const guilds = await filterGuilds()
		.then(guilds => {
			console.log('Fetched guilds successfully ', guilds.length);
			return guilds;
		})
		.catch(err => {
			console.error('Failed to fetch guilds ', err);
			return [];
		});

	return (
		<AuthProvider session={session}>
			<div className='flex flex-col items-center h-[100dvh] w-full'>
				<div className='hidden flex-row w-full justify-between border-b md:flex'>
					<div className='flex h-16 items-center px-4'>
						<GuildSwitcher guilds={guilds} />
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
							<GuildSwitcher guilds={guilds} />
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

	if (!Array.isArray(userGuilds) || !Array.isArray(botGuilds)) {
		return [];
	}

	// Filter and map the guilds
	const guilds: GuildsResponse[] = botGuilds
		.filter(guild =>
			userGuilds.some(userGuild => userGuild.id === guild.id)
		)
		.map(guild => ({ ...guild, botAccess: true }));

	return guilds;
};
