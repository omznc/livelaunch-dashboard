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
import env from "@env";
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
	listenForInviteEvent?: boolean;
}

export default function GuildSwitcher({ className, guilds, listenForInviteEvent }: GuildSwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [showNewGuildDialog, setShowNewGuildDialog] = React.useState(false);
	const [revalidating, setRevalidating] = React.useState(false);
	const [revalidationCooldown, setRevalidationCooldown] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [showRocket, setShowRocket] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);
	const cooldownTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const params = useSearchParams();
	const router = useRouter();
	const selectedGuild = guilds.find((guild) => guild.id === params.get("g"));
	const [pending, startTransition] = useTransition();
	const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=17601312868352&scope=bot%20applications.commands`;
	const discordDeepLink = `discord://-/application-directory/${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`;
	const sortedGuilds = useMemo(
		() =>
			[...guilds].sort((a, b) => {
				if (a.botAccess && !b.botAccess) return -1;
				if (!a.botAccess && b.botAccess) return 1;
				return a.name.localeCompare(b.name);
			}),
		[guilds],
	);

	useEffect(() => {
		if (!selectedGuild && sortedGuilds.length !== 0) {
			const firstGuildWithBot = sortedGuilds.find((guild) => guild.botAccess);
			const targetGuild = firstGuildWithBot ?? sortedGuilds[0];
			router.replace(`?g=${targetGuild.id}`);
		}
	}, [router, selectedGuild, sortedGuilds]);

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

	useEffect(() => {
		setMounted(true);
	}, []);

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
							className={cn("w-[200px] justify-between border-0 bg-black/50", className, {
								"animate-pulse": pending,
							})}
						>
							{selectedGuild ? (
								<>
									<Avatar className="mr-2 h-5 w-5">
										{selectedGuild.icon ? (
											<Image
												width={50}
												height={50}
												src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
												alt={selectedGuild.name}
											/>
										) : (
											<AvatarFallback>{selectedGuild.name[0] || "LL"}</AvatarFallback>
										)}
									</Avatar>
									<span className="truncate">{selectedGuild.name}</span>
								</>
							) : (
								<span className="animate-pulse truncate">Just a moment...</span>
							)}
							<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0">
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
											<Avatar className="mr-2 h-5 w-5">
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
											<div className="flex flex-col">
												<span>{guild.name}</span>
												{!guild.botAccess && (
													<span className="text-muted-foreground text-xs">Bot not added</span>
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
			{showRocket && mounted && typeof document !== "undefined"
				? createPortal(<div className="rocket-fly">🚀</div>, document.body)
				: null}
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
								className="cursor-pointer font-medium text-primary underline underline-offset-4 transition-all hover:brightness-125"
								disabled={revalidating || revalidationCooldown}
								onClick={async (_e) => {
									try {
										if (cooldownTimer.current) {
											clearTimeout(cooldownTimer.current);
										}
										setRevalidating(true);
										await revalidateGuilds({});
										router.refresh();
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
