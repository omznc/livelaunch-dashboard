'use client';

import { cn } from '@/lib/utils';
import RetainQueryLink from '@components/retain-query-link';
import { usePathname, useSearchParams } from 'next/navigation';
import { enabled_guilds } from '@prisma/client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { getGuild } from '@app/(dashboard)/actions';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@components/ui/dialog';
import { DialogBody } from 'next/dist/client/components/react-dev-overlay/internal/components/Dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion';
import { Button, buttonVariants } from '@components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@components/ui/skeleton';

const links = [
	{
		href: '/',
		label: 'Home',
	},
	{
		href: '/general',
		label: 'General',
		requiresGuildEnabled: true,
	},
	{
		href: '/agencies',
		label: 'Agencies',
		requiresGuildEnabled: true,
	},
	{
		href: '/news-sites',
		label: 'News Sites',
		requiresGuildEnabled: true,
	},
	{
		href: '/notifications',
		label: 'Notifications',
		requiresGuildEnabled: true,
	},
];

interface NavProps extends React.HTMLAttributes<HTMLElement> {
}

export function Nav({ className, ...props }: NavProps) {
	const path = usePathname();
	const params = useSearchParams();
	const guildId = params.get('g');
	const [guild, setGuild] = useState<enabled_guilds | null | undefined>(null);
	const [mounted, setMounted] = useState(false);
	const [ranGetGuild, setRanGetGuild] = useState(false);
	const [showHelpDialog, setShowHelpDialog] = useState(false);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		if (!guildId) return;
		setRanGetGuild(true);
		getGuild(guildId).then(value => setGuild(value));
	}, [guildId, mounted]);

	if (!mounted || !ranGetGuild)
		return (
			<div className='ml-4 flex items-center justify-evenly md:justify-start space-x-4 lg:space-x-6'>
				{links.map(({ href, label }) => (
					<Skeleton key={href} className={cn(`h-4`, `w-16`)} />
				))}
			</div>
		);

	return (
		<>
			<nav
				className={cn(
					'flex animate-fade-in items-center justify-evenly md:justify-start space-x-4 lg:space-x-6',
					className,
				)}
				{...props}
			>
				{!guild && (
					<Button
						variant='outline'
						onClick={() => setShowHelpDialog(true)}
						className={'-ml-4'}
					>
						Enable LiveLaunch
					</Button>
				)}
				{links
					.filter(
						({ requiresGuildEnabled }) =>
							!requiresGuildEnabled ||
							(requiresGuildEnabled && guild),
					)
					.map(({ href, label }) => (
						<RetainQueryLink
							key={`${href}${label}`}
							href={href}
							className={cn(
								'text-sm font-medium text-center opacity-80 transition-all',
								{
									'font-bold opacity-100': path === href,
								},
							)}
						>
							{label}
						</RetainQueryLink>
					))}
			</nav>
			<Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Enable LiveLaunch</DialogTitle>
						<DialogDescription>
							You have to enable LiveLaunch in your server to be
							able to access settings on this dashboard. It is
							pretty straightforward, I promise.
						</DialogDescription>
					</DialogHeader>
					<DialogBody className='flex flex-col gap-2'>
						To enable the bot you need to run the following command
						in your server
						<code className='relative p-4 block w-full rounded bg-muted font-mono text-sm font-semibold'>
							{`/enable <feature>`}
						</code>
						Where the feature is one of the following
						<Accordion type='single' collapsible>
							<AccordionItem value='item-1'>
								<AccordionTrigger>
									notifications
								</AccordionTrigger>
								<AccordionContent>
									Send notifications to the specified channel.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value='item-2'>
								<AccordionTrigger>news</AccordionTrigger>
								<AccordionContent>
									Send space related news to the specified
									channel.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value='item-3'>
								<AccordionTrigger>messages</AccordionTrigger>
								<AccordionContent>
									Send YouTube livestreams to the specified
									channel.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem
								value='item-4'
								className='border-none'
							>
								<AccordionTrigger>events</AccordionTrigger>
								<AccordionContent>
									Create Discord events with a maximum of 50
									events at any given time.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</DialogBody>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setShowHelpDialog(false)}
						>
							Close
						</Button>
						<Link
							className={buttonVariants({
								variant: 'default',
							})}
							href={'discord://-/'}
						>
							Open Discord
						</Link>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
