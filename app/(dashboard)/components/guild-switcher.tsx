'use client';

import * as React from 'react';
import { useEffect, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button, buttonVariants } from '@components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@components/ui/command';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@components/ui/popover';
import { RxCaretSort } from 'react-icons/rx';
import { CheckIcon, PlusCircle } from 'lucide-react';
import { GuildsResponse } from '@app/(dashboard)/layout';
import { revalidateGuilds } from '@app/(dashboard)/actions';
import { DialogBody } from 'next/dist/client/components/react-dev-overlay/internal/components/Dialog';
import { BiRefresh } from 'react-icons/bi';
import { useRouter, useSearchParams } from 'next/navigation';
import env from '@env';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
	typeof PopoverTrigger
>;

interface GuildSwitcherProps extends PopoverTriggerProps {
	guilds: GuildsResponse[];
}

export default function GuildSwitcher({
	className,
	guilds,
}: GuildSwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [showNewGuildDialog, setShowNewGuildDialog] = React.useState(false);
	const [revalidating, setRevalidating] = React.useState(false);
	const [revalidationCooldown, setRevalidationCooldown] =
		React.useState(false);
	const params = useSearchParams();
	const router = useRouter();
	const selectedGuild = guilds.find(guild => guild.id === params.get('g'));
	const [pending, startTransition] = useTransition();

	useEffect(() => {
		if (!selectedGuild && guilds.length !== 0) {
			router.push(`?g=${guilds[0].id}`);
		}
	}, [guilds, router, selectedGuild]);

	return (
		<Dialog open={showNewGuildDialog} onOpenChange={setShowNewGuildDialog}>
			{guilds.length !== 0 && (
				<>
					<Button
						variant={'outline'}
						className={'p-3 mr-2'}
						onClick={() => {
							setShowNewGuildDialog(true);
						}}
					>
						<FaPlus />
					</Button>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={open}
								aria-label='Select a Guild'
								className={cn(
									'w-[200px] justify-between',
									className,
									{
										'animate-pulse': pending,
									}
								)}
							>
								{selectedGuild ? (
									<>
										<Avatar className='mr-2 h-5 w-5'>
											<AvatarImage
												src={
													selectedGuild.icon
														? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`
														: undefined
												}
												alt={selectedGuild.name}
											/>
											<AvatarFallback>
												{selectedGuild.name[0] || 'LL'}
											</AvatarFallback>
										</Avatar>
										<span className='truncate'>
											{selectedGuild.name}
										</span>
									</>
								) : (
									<span className='truncate animate-pulse'>
										Just a moment...
									</span>
								)}
								<RxCaretSort className='ml-auto h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-[200px] p-0'>
							<Command>
								<CommandList>
									<CommandInput placeholder='Search for a server...' />
									<CommandEmpty>No guild found.</CommandEmpty>
									<CommandGroup heading={'Your Guilds'}>
										{guilds.map(guild => (
											<CommandItem
												key={guild.id}
												onSelect={async () => {
													if (guild.botAccess) {
														setOpen(false);
														startTransition(() => {
															router.push(
																`/?g=${guild.id}`
															);
														});
													} else {
														setShowNewGuildDialog(
															true
														);
													}
												}}
												className='text-sm'
											>
												<Avatar className='mr-2 h-5 w-5'>
													<AvatarImage
														src={
															guild.icon
																? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
																: undefined
														}
														alt={guild.name}
													/>
													<AvatarFallback>
														{guild.name[0] || 'LL'}
													</AvatarFallback>
												</Avatar>
												{guild.name}
												<CheckIcon
													className={cn(
														'ml-auto h-4 w-4',
														selectedGuild?.id ===
															guild.id
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
								<CommandSeparator />
								<CommandList>
									<CommandGroup>
										<DialogTrigger asChild>
											<CommandItem
												onSelect={() => {
													setOpen(false);
													setShowNewGuildDialog(true);
												}}
											>
												<PlusCircle className='mr-2 h-5 w-5' />
												Add a Server
											</CommandItem>
										</DialogTrigger>
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</>
			)}
			{guilds.length === 0 && (
				<Button
					onClick={() => {
						setShowNewGuildDialog(true);
					}}
				>
					Add a Guild
				</Button>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a Guild</DialogTitle>
					<DialogDescription>
						To add a server, you must be an administrator.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className='inline-flex justify-center sm:justify-start gap-1'>
					{revalidationCooldown ? (
						`You've refreshed the servers recently, please wait a few seconds.`
					) : (
						<>
							Is LiveLaunch already in your server?
							<span
								className='font-medium cursor-pointer text-primary underline underline-offset-4 transition-all hover:brightness-125'
								onClick={async e => {
									setRevalidating(true);
									await revalidateGuilds().then(() => {
										setRevalidating(false);
										setRevalidationCooldown(true);
										setTimeout(() => {
											setRevalidationCooldown(false);
										}, 10000);
									});
								}}
							>
								{revalidating ? (
									<BiRefresh className='animate-spin h-5 w-5' />
								) : (
									'Refresh'
								)}
							</span>
						</>
					)}
				</DialogBody>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setShowNewGuildDialog(false)}
					>
						Cancel
					</Button>
					<Link
						className={buttonVariants({
							variant: 'secondary',
						})}
						href={`https://discord.com/oauth2/authorize?client_id=${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`}
						target={'_blank'}
					>
						Open in Browser
					</Link>
					<Link
						className={buttonVariants({
							variant: 'default',
						})}
						href={`discord://-/application-directory/${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`}
						onClick={() => toast.success('Check your Discord app.')}
					>
						Open in Discord
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
