"use client";

import { enableGuild } from "@app/(dashboard)/actions";
import type { GuildsResponse } from "@app/(dashboard)/layout";
import RetainQueryLink from "@components/retain-query-link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { Button, buttonVariants } from "@components/ui/button";
import {
	Credenza,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
} from "@components/ui/credenza";
import type { enabled_guilds } from "@generated/client";
import { cn } from "@lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const links = [
	{
		href: "/",
		label: "Home",
	},
	{
		href: "/general",
		label: "General",
		requiresGuildEnabled: true,
	},
	{
		href: "/agencies",
		label: "Agencies",
		requiresGuildEnabled: true,
	},
	{
		href: "/news",
		label: "News",
		requiresGuildEnabled: true,
	},
	{
		href: "/notifications",
		label: "Notifications",
		requiresGuildEnabled: true,
	},
];

interface NavProps extends React.HTMLAttributes<HTMLElement> {
	guilds?: enabled_guilds[];
	allGuilds?: GuildsResponse[];
}

export function Nav({ className, guilds, allGuilds, ...props }: NavProps) {
	const path = usePathname();
	const params = useSearchParams();
	const guildId = params.get("g") ?? "";
	const [showHelpDialog, setShowHelpDialog] = useState(false);
	const router = useRouter();

	const guild = useMemo(() => {
		if (!guilds) return null;
		return guilds.find((guild) => guild.guild_id.toString() === guildId);
	}, [guildId, guilds]);

	const selectedFullGuild = useMemo(() => {
		if (!allGuilds) return null;
		return allGuilds.find((guild) => guild.id === guildId) ?? null;
	}, [allGuilds, guildId]);

	useEffect(() => {
		const handleShowHelpDialog = (e: Event) => {
			e.stopImmediatePropagation();
			setShowHelpDialog(true);
		};

		window.addEventListener("showHelpDialog", handleShowHelpDialog);
		return () => {
			window.removeEventListener("showHelpDialog", handleShowHelpDialog);
		};
	}, []);

	return (
		<>
			<nav className={cn("flex animate-fade-in items-center justify-start transition-all", className)} {...props}>
				<div className="flex w-full items-center justify-start gap-4 overflow-x-auto border-b px-4 transition-all md:border-b-0">
					{guildId &&
						(selectedFullGuild && !selectedFullGuild.botAccess ? (
							<Button
								variant="outline"
								onClick={() => {
									window.dispatchEvent(new Event("openInviteGuildDialog"));
								}}
							>
								Invite LiveLaunch
							</Button>
						) : (
							!guild && (
								<Button variant="outline" onClick={() => setShowHelpDialog(true)}>
									Enable LiveLaunch
								</Button>
							)
						))}
					{links
						.filter(({ requiresGuildEnabled }) => !requiresGuildEnabled || (requiresGuildEnabled && guild))
						.map(({ href, label }) => (
							<RetainQueryLink
								key={`${href}${label}`}
								href={href}
								className={cn(
									"rounded-md px-3 py-4 text-center font-medium font-monospace text-sm opacity-60 transition-all duration-200 hover:opacity-100",
									{
										"font-bold opacity-100": path === href,
									},
								)}
							>
								{label}
							</RetainQueryLink>
						))}
				</div>
			</nav>
			<Credenza open={showHelpDialog} onOpenChange={setShowHelpDialog}>
				<CredenzaContent>
					<CredenzaHeader>
						<CredenzaTitle>Enable LiveLaunch</CredenzaTitle>
						<CredenzaDescription>
							You have to enable LiveLaunch in your server to be able to access settings on this
							dashboard. It is pretty straightforward, I promise.
						</CredenzaDescription>
					</CredenzaHeader>
					<div className="flex flex-col gap-2 overflow-y-auto px-4">
						To enable the bot you need to run the following command in your server
						<code className="relative block w-full rounded bg-muted p-4 font-mono font-semibold text-sm">
							{"/enable <feature>"}
						</code>
						Where the feature is one of the following
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>notifications</AccordionTrigger>
								<AccordionContent>Send notifications to the specified channel.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>news</AccordionTrigger>
								<AccordionContent>Send space related news to the specified channel.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>messages</AccordionTrigger>
								<AccordionContent>Send YouTube livestreams to the specified channel.</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-4" className="border-none">
								<AccordionTrigger>events</AccordionTrigger>
								<AccordionContent>
									Create Discord events with a maximum of 50 events at any given time.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
						<CredenzaDescription>
							{`Note: if you use 'Enable Automatically' you will
							still need to enable at least one feature, otherwise
							the bot will disable itself after a while.`}
						</CredenzaDescription>
					</div>
					<CredenzaFooter className="gap-2 md:gap-1">
						<Button variant="outline" onClick={() => setShowHelpDialog(false)}>
							Close
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								toast.promise(enableGuild({ guildId: String(guildId) }), {
									loading: "Enabling...",
									success: () => {
										router.refresh();
										setShowHelpDialog(false);
										return "Enabled!";
									},
									error: "Failed to enable.",
								});
							}}
						>
							Enable Automatically
						</Button>
						<Link
							className={buttonVariants({
								variant: "default",
							})}
							href={"discord://-/"}
						>
							Open Discord
						</Link>
					</CredenzaFooter>
				</CredenzaContent>
			</Credenza>
		</>
	);
}
