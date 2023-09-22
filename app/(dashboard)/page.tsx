import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@components/ui/card';
import { buttonVariants } from '@components/ui/button';
import Link from 'next/link';
import env from '@env';
import { cn } from '@lib/utils';
import { FaArrowUp, FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa';
import { BiSolidUpvote } from 'react-icons/bi';

export default async function Home() {
	const topgg = await fetch(
		`https://top.gg/api/bots/${
			env.NODE_ENV === 'development'
				? '869969874036867082'
				: env.NEXT_PUBLIC_DISCORD_CLIENT_ID
		}`,
		{
			headers: {
				Authorization: env.TOPGG_TOKEN,
			},
		}
	).then(res => res.json() as Promise<TopGGResponse>);

	return (
		<div className='flex flex-col w-full h-full justify-start items-center'>
			<div className='flex flex-col gap-2 w-full h-full justify-center items-center'>
				<h1 className='text-6xl inline-flex items-center gap-2 font-bold'>
					{/*<LuRocket />*/}
					LiveLaunch Dashboard
				</h1>
				<p className='text-xl font-medium'>
					{
						'Creates space related events and sends news, notifications and live streams!'
					}
				</p>
			</div>
			<div className='flex w-full flex-wrap h-full gap-4 justify-center items-stretch max-h-[300px]'>
				<Card className='w-[350px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>We are open source</CardTitle>
						<CardDescription>
							We are open source, and you can find our code on
							GitHub.
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex justify-between'>
						<Link
							className={cn(
								buttonVariants({
									variant: 'secondary',
								}),
								'inline-flex gap-2'
							)}
							href={
								'https://github.com/omznc/livelaunch-dashboard'
							}
							target={'_blank'}
						>
							<FaGithub />
							Dashboard
							<FaArrowUp className='rotate-45' />
						</Link>
						<Link
							className={cn(
								buttonVariants({
									variant: 'default',
								}),
								'inline-flex gap-2'
							)}
							href={'https://github.com/juststephen/livelaunch'}
							target={'_blank'}
						>
							<FaGithub />
							LiveLaunch
							<FaArrowUp className='rotate-45' />
						</Link>
					</CardFooter>
				</Card>
				<Card className='w-[350px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>Vote for us</CardTitle>
						<CardDescription>
							{`
								Did you know that you can vote for LiveLaunch on top.gg?
								Let's pump those numbers up, these are rookie numbers.
							`}
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex justify-end'>
						<Link
							className={cn(
								buttonVariants({
									variant: 'default',
								}),
								'inline-flex gap-2'
							)}
							href={`https://top.gg/bot/${
								env.NODE_ENV === 'development'
									? '869969874036867082'
									: env.NEXT_PUBLIC_DISCORD_CLIENT_ID
							}/vote`}
							target={'_blank'}
						>
							<BiSolidUpvote />
							Vote
							<FaArrowUp className='rotate-45' />
						</Link>
					</CardFooter>
				</Card>
				<Card className='w-[350px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>Support</CardTitle>
						<CardDescription>
							Need help? Have a suggestion? Join our Discord, or
							message a developer.
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex justify-between'>
						<div className='flex gap-2'>
							<Link
								className={cn(
									buttonVariants({
										variant: 'secondary',
									}),
									'inline-flex gap-2'
								)}
								href={'https://twitter.com/ImKez'}
								target={'_blank'}
							>
								<FaTwitter />
								Dashboard Help
								<FaArrowUp className='rotate-45' />
							</Link>
							<Link
								className={cn(
									buttonVariants({
										variant: 'secondary',
									}),
									'inline-flex gap-2'
								)}
								href={'https://twitter.com/Juststephen_TV'}
								target={'_blank'}
							>
								<FaTwitter />
								Bot Help
								<FaArrowUp className='rotate-45' />
							</Link>
						</div>
						<Link
							className={cn(
								buttonVariants({
									variant: 'default',
								}),
								'inline-flex gap-2'
							)}
							href={`https://discord.gg/${topgg.support}`}
							target={'_blank'}
						>
							<FaDiscord />
							Discord
							<FaArrowUp className='rotate-45' />
						</Link>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export interface TopGGResponse {
	defAvatar: string;
	invite: string;
	website: string;
	support: string;
	github: string;
	longdesc: string;
	shortdesc: string;
	prefix: string;
	lib: string;
	clientid: string;
	avatar: string;
	id: string;
	discriminator: string;
	username: string;
	date: string;
	server_count: number;
	shard_count: number;
	guilds: string[];
	shards: string[];
	monthlyPoints: number;
	points: number;
	certifiedBot: boolean;
	owners: string[];
	tags: string[];
	donatebotguildid: string;
}
