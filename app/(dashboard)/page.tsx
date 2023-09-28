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
import { FaArrowUp, FaDiscord, FaGithub, FaHashtag } from 'react-icons/fa';
import { BiSolidUpvote } from 'react-icons/bi';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@components/ui/tooltip';
import PartnerTheSpaceDevs from '@public/Partner_TheSpaceDevs.png';
import PartnerOmznc from '@public/Partner_omznc.jpg';
import Image from 'next/image';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import RetainQueryLink from '@components/retain-query-link';
import React from 'react';

export default async function Home() {
	return (
		<div className='flex flex-col gap-24'>
			<div className='flex flex-col gap-2 p-2 w-full h-full justify-center items-center'>
				<h1 className='text-6xl inline-flex text-center items-center gap-2 font-bold'>
					{/*<LuRocket />*/}
					LiveLaunch Dashboard
				</h1>
				<p className='inline text-lg text-center w-full font-medium'>
					{
						'Creates space related events and sends news, notifications and live streams! '
					}
					<Link
						href={'https://juststephen.com/projects/LiveLaunch'}
						className='inline-flex items-center gap-1 brightness-125 hover:underline'
					>
						Learn More <FaArrowUp className='rotate-45' />
					</Link>
				</p>
			</div>
			<div className='flex w-full flex-wrap h-full gap-4 justify-center items-stretch max-h-[300px]'>
				<Card className='w-full md:w-[400px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>LiveLaunch is open source</CardTitle>
						<CardDescription>
							{
								'LiveLaunch is completely open source, both the bot and the dashboard. You can find the source code on GitHub.'
							}
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex flex-wrap gap-2 justify-between'>
						<Link
							className={cn(
								buttonVariants({
									variant: 'secondary',
								}),
								'inline-flex gap-2 w-full md:w-fit'
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
								'inline-flex gap-2 w-full md:w-fit'
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
				<Card className='w-full md:w-[400px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>Vote for LiveLaunch</CardTitle>
						<CardDescription>
							{`
								Did you know that you can vote for LiveLaunch on top.gg?
								Let's pump those numbers up, these are rookie numbers.
							`}
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex flex-wrap justify-end'>
						<Link
							className={cn(
								buttonVariants({
									variant: 'default',
								}),
								'inline-flex gap-2 w-full md:w-fit'
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
				<Card className='w-full md:w-[400px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>Support</CardTitle>
						<CardDescription>
							Need help? Have a suggestion? Join our Discord, or
							message a developer.
						</CardDescription>
					</CardHeader>
					<CardFooter className='flex flex-wrap gap-2 justify-between'>
						<div className='flex gap-2 w-full md:w-fit'>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										className={'w-full md:w-fit'}
									>
										<Link
											className={cn(
												buttonVariants({
													variant: 'secondary',
												}),
												'inline-flex gap-2 w-full md:w-fit'
											)}
											href={
												'discord://-/channels/151026584164237312/967838544766836777'
											}
										>
											<FaHashtag />
											support
										</Link>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											This only works if you are in the
											server.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<Link
							className={cn(
								buttonVariants({
									variant: 'default',
								}),
								'inline-flex gap-2 w-full md:w-fit'
							)}
							href={`https://discord.gg/nztN2FXe7A`}
							target={'_blank'}
						>
							<FaDiscord />
							Discord
							<FaArrowUp className='rotate-45' />
						</Link>
					</CardFooter>
				</Card>
				<Card className='w-full md:w-[400px] flex-grow justify-between flex-col flex'>
					<CardHeader>
						<CardTitle>Partners</CardTitle>
						<CardDescription>
							{
								'LiveLaunch is powered by some amazing partners. Check them out!'
							}
						</CardDescription>
					</CardHeader>
					<CardContent className={'grid grid-cols-2 gap-2'}>
						<HoverCard openDelay={200}>
							<HoverCardTrigger asChild>
								<Link
									href={'https://thespacedevs.com/'}
									target={'_blank'}
									className={
										'w-full border rounded-lg overflow-hidden transition-all hover:brightness-125'
									}
								>
									<Image
										src={PartnerTheSpaceDevs}
										alt={'TheSpaceDevs'}
									/>
								</Link>
							</HoverCardTrigger>
							<HoverCardContent className='flex flex-col gap-4'>
								<div className='flex gap-2 items-center space-between'>
									<h3 className={'font-bold'}>
										The Space Devs
									</h3>
								</div>
								<div className={'flex flex-col gap-2'}>
									<p className={'text-sm'}>
										{'The Space Devs were very helpful during the development of LiveLaunch. ' +
											'They came up with great ideas for better integration between their LL2 API ' +
											'and the LiveLaunch Discord bot. '}
									</p>
									<p className={'text-sm'}>
										{'Perhaps in the future LiveLaunch will have more features ' +
											'thanks to the great data from their APIs. '}
									</p>
								</div>
							</HoverCardContent>
						</HoverCard>
						<HoverCard openDelay={200}>
							<HoverCardTrigger asChild>
								<Link
									href={'https://omarzunic.com'}
									target={'_blank'}
									className={
										'w-full border rounded-lg overflow-hidden transition-all hover:brightness-125'
									}
								>
									<Image
										src={PartnerOmznc}
										alt={'Omar Zunic'}
									/>
								</Link>
							</HoverCardTrigger>
							<HoverCardContent className='flex flex-col gap-4'>
								<div className='flex gap-2 items-center space-between'>
									<Avatar>
										<AvatarImage
											src={
												'https://avatars.githubusercontent.com/u/38432561'
											}
											alt={'Omar Zunic'}
										/>
										<AvatarFallback>OZ</AvatarFallback>
									</Avatar>
									<h3 className={'font-bold'}>Omar Zunic</h3>
								</div>
								<div className={'flex flex-col gap-2'}>
									<p className={'text-sm'}>
										{
											'A software developer from Bosnia and Herzegovina, and the creator of this dashboard.'
										}
									</p>
								</div>
							</HoverCardContent>
						</HoverCard>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
