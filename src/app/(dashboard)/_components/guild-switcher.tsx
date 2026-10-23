"use client";

import { revalidateGuilds } from "@app/(dashboard)/actions";
import type { GuildsResponse } from "@app/(dashboard)/layout";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button, buttonVariants } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import {
	Credenza,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
} from "@components/ui/credenza";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { unwrap } from "@lib/action-result";
import { compareGuilds } from "@lib/guild-order";
import { cn } from "@lib/utils";
import { CheckIcon, ChevronsUpDown, RefreshCw } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import * as React from "react";
import { useEffect, useMemo, useTransition } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface GuildSwitcherProps extends PopoverTriggerProps {
	guilds: GuildsResponse[];
	clientId: string;
	listenForInviteEvent?: boolean;
}

function GuildAvatar({ guild }: { guild: GuildsResponse }) {
	return (
		<Avatar className="mr-1 h-6 w-6">
			{guild.icon ? (
				<Image
					width={50}
					height={50}
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
					alt={guild.name}
				/>
			) : (
				<AvatarFallback>{guild.name[0] || "LL"}</AvatarFallback>
			)}
		</Avatar>
	);
}

function RocketPortal({ show }: { show: boolean }) {
	const [mounted, setMounted] = React.useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!show || !mounted) return null;
	return createPortal(<div className="rocket-fly">🚀</div>, document.body);
}

export default function GuildSwitcher({ className, guilds, clientId, listenForInviteEvent }: GuildSwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [showNewGuildDialog, setShowNewGuildDialog] = React.useState(false);
	const [revalidating, setRevalidating] = React.useState(false);
	const [revalidationCooldown, setRevalidationCooldown] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [showRocket, setShowRocket] = React.useState(false);
	const cooldownTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const params = useSearchParams();
	const router = useRouter();
	const selectedGuild = guilds.find((guild) => guild.id === params.get("g"));
	const [pending, startTransition] = useTransition();
	const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=17601312868352&scope=bot%20applications.commands`;
	const discordDeepLink = `discord://-/application-directory/${clientId}`;
	const sortedGuilds = useMemo(() => [...guilds].sort(compareGuilds), [guilds]);

	useEffect(() => {
		return () => {
			if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
		};
	}, []);

	useEffect(() => {
		if (!listenForInviteEvent) return;
		const handler = () => setShowNewGuildDialog(true);
		window.addEventListener("openInviteGuildDialog", handler);
		return () => {
			window.removeEventListener("openInviteGuildDialog", handler);
		};
	}, [listenForInviteEvent]);

	return (
		<Credenza open={showNewGuildDialog} onOpenChange={setShowNewGuildDialog}>
			{sortedGuilds.length !== 0 && (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							aria-label="Select a Guild"
							className={cn(
								"h-full w-full min-w-0 justify-between border-0 px-4 font-sans text-[15px] data-[state=open]:bg-raised focus-visible:outline-offset-[-2px]",
								className,
								{
									"animate-pulse": pending,
								},
							)}
						>
							{selectedGuild ? (
								<>
									<GuildAvatar guild={selectedGuild} />
									<span className="truncate">{selectedGuild.name}</span>
								</>
							) : (
								<span className="animate-pulse truncate">Just a moment...</span>
							)}
							<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-fg3" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" sideOffset={0} className="w-[280px] max-w-[calc(100vw-2rem)] p-0">
						<Command>
							<CommandList>
								<CommandInput
									placeholder="Search for a server..."
									value={search}
									onValueChange={(v) => {
										setSearch(v);
										if (v.trim().toLowerCase() === "rocket") {
											setShowRocket(true);
											posthog.capture("easter_egg_rocket");
											setTimeout(() => setShowRocket(false), 1800);
										}
									}}
								/>
								<CommandEmpty>No guild found.</CommandEmpty>
								<CommandGroup heading={"Your Guilds"}>
									{sortedGuilds.map((guild) => (
										<CommandItem
											key={guild.id}
											onSelect={() =>
												startTransition(() => {
													setOpen(false);
													if (guild.botAccess) {
														router.push(`?g=${guild.id}`);
													} else {
														setShowNewGuildDialog(true);
													}
												})
											}
											className="text-sm"
										>
											<GuildAvatar guild={guild} />
											<div className="flex flex-col">
												<span>{guild.name}</span>
												{!guild.botAccess && (
													<span className="text-fg3 text-[13px]">Bot not added</span>
												)}
											</div>
											<CheckIcon
												className={cn(
													"ml-auto h-4 w-4",
													selectedGuild?.id === guild.id ? "opacity-100" : "opacity-0",
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}
			{sortedGuilds.length === 0 && (
				<Button
					onClick={() => {
						setShowNewGuildDialog(true);
					}}
				>
					Add a Guild
				</Button>
			)}
			<RocketPortal show={showRocket} />
			<CredenzaContent>
				<CredenzaHeader>
					<CredenzaTitle>Invite LiveLaunch</CredenzaTitle>
					<CredenzaDescription>
						{selectedGuild && !selectedGuild.botAccess
							? `Invite LiveLaunch to ${selectedGuild.name} to get started.`
							: "To add LiveLaunch to a server, you must be an administrator."}
					</CredenzaDescription>
				</CredenzaHeader>
				<div className="inline-flex justify-center gap-1 sm:justify-start">
					{revalidationCooldown ? (
						"Refreshed! Check the server list again, or try again in a few seconds."
					) : (
						<>
							Is LiveLaunch already in your server?
							<button
								type="button"
								className="cursor-pointer font-medium text-brand underline underline-offset-4 hover:text-fg"
								disabled={revalidating || revalidationCooldown}
								onClick={async (_e) => {
									try {
										if (cooldownTimer.current) {
											clearTimeout(cooldownTimer.current);
										}
										setRevalidating(true);
										await unwrap(revalidateGuilds({}));
										setRevalidationCooldown(true);
										cooldownTimer.current = setTimeout(() => {
											setRevalidationCooldown(false);
										}, 10000);
									} catch (_error) {
										toast.error("Refresh failed");
									} finally {
										setRevalidating(false);
									}
								}}
							>
								{revalidating ? <RefreshCw className="h-5 w-5 animate-spin-reverse" /> : "Refresh"}
							</button>
						</>
					)}
				</div>
				<CredenzaFooter className="gap-2 md:gap-1">
					<Button
						variant="outline"
						onClick={() => {
							navigator.clipboard.writeText(inviteUrl);
							toast.success("Invite link copied to clipboard");
						}}
					>
						Copy invite
					</Button>
					<Link
						className={buttonVariants({
							variant: "secondary",
						})}
						href={inviteUrl as Route}
						target={"_blank"}
						rel="noreferrer"
					>
						Open in Browser
					</Link>
					<Link
						className={buttonVariants({
							variant: "default",
						})}
						href={discordDeepLink as Route}
						onClick={() => toast.success("Check your Discord app.")}
					>
						Open in Discord
					</Link>
				</CredenzaFooter>
			</CredenzaContent>
		</Credenza>
	);
}
