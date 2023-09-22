import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import AuthProvider from '@components/auth-provider';
import { redirect } from 'next/navigation';
import GuildSwitcher from '@app/(dashboard)/components/guild-switcher';
import { Nav } from '@app/(dashboard)/components/nav';
import { ThemeToggle } from '@components/theme-toggle';
import User from '@app/(dashboard)/components/user';
import env from '@env';
import { RESTAPIPartialCurrentUserGuild } from 'discord.js';
import prisma from '@lib/prisma';
import { enabled_guilds } from '@prisma/client';

export const metadata: Metadata = {
	title: 'LiveLaunch Dashboard',
	description: 'The dashboard for LiveLaunch, a Discord bot.',
};

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	if (session?.user) {
		return (
			<AuthProvider session={session}>
				<div className='flex flex-col h-[100dvh] w-full'>
					<div className='hidden flex-row justify-between border-b md:flex'>
						<div className='flex h-16 items-center px-4'>
							<GuildSwitcher guilds={await filterGuilds()} />
							<Nav className='mx-6' />
						</div>
						<div className='flex h-16 items-center gap-4 px-4'>
							<ThemeToggle />
							<User />
						</div>
					</div>
					<div className='flex flex-col h-full w-full overflow-scroll p-8'>
						{children}
					</div>
				</div>
			</AuthProvider>
		);
	}
	return redirect('/login');
}

export const getBotGuilds = async () => {
	const resp = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
		next: {
			revalidate: 60,
			tags: ['get-bot-guilds'],
		},
	}).then(resp => resp.json() as Promise<RESTAPIPartialCurrentUserGuild[]>);

	return resp;
};

export interface GuildsResponse extends RESTAPIPartialCurrentUserGuild {
	botAccess: boolean;
}

export const getUserGuilds = async () => {
	const session = await getServerSession(authOptions);
	if (!session) return [];

	const resp = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: { authorization: `Bearer ${session?.account?.access_token}` },
		next: {
			revalidate: 60 * 5,
			tags: [`get-user-guilds-${session?.account?.id}`],
		},
	}).then(resp => resp.json() as Promise<RESTAPIPartialCurrentUserGuild[]>);

	// console.log(resp);

	return resp?.filter(guild => (parseInt(guild.permissions) & 0x8) === 0x8);
};

const filterGuilds = async () => {
	const [userGuilds, botGuilds] = await Promise.all([
		getUserGuilds(),
		getBotGuilds(),
	]);

	// return the guilds the bot and user share
	const guilds: GuildsResponse[] = botGuilds
		.filter(guild =>
			userGuilds.some(userGuild => userGuild.id === guild.id)
		)
		.map(guild => ({ ...guild, botAccess: true }));

	return guilds;
};
