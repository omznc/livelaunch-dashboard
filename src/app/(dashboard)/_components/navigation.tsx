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
import { Power, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
		href: "/notifications",
		label: "Notifications",
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
];

interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
	guilds?: Pick<enabled_guilds, "guild_id">[];
	allGuilds?: GuildsResponse[];
}

// Moves the underline to the current tab with transform only.
function placeIndicator(strip: HTMLElement) {
	const bar = strip.querySelector<HTMLElement>("[data-indicator]");
	if (!bar) return;
	const current = strip.querySelector<HTMLElement>('[aria-current="page"]');
	if (!current) {
		bar.style.opacity = "0";
		return;
	}
	bar.style.opacity = "1";
	bar.style.transform = `translateX(${current.offsetLeft}px) scaleX(${current.offsetWidth})`;
}

function useIndicator(path: string, count: number) {
	const ref = useRef<HTMLDivElement>(null);

	// The first placement does not slide. The bar follows a resize.
	useLayoutEffect(() => {
		const strip = ref.current;
		if (!strip) return;
		placeIndicator(strip);
		const frame = requestAnimationFrame(() => {
			strip.querySelector<HTMLElement>("[data-indicator]")?.setAttribute("data-ready", "");
		});
		const watch = new ResizeObserver(() => placeIndicator(strip));
		watch.observe(strip);
		for (const child of strip.children) watch.observe(child);
		return () => {
			cancelAnimationFrame(frame);
			watch.disconnect();
		};
	}, []);

	useLayoutEffect(() => {
		if (ref.current) placeIndicator(ref.current);
	}, [path, count]);

	return ref;
}

export function Navigation({ className, guilds, allGuilds, ...props }: NavigationProps) {
	const path = usePathname();
	const params = useSearchParams();
	const guildId = params.get("g") ?? "";
	const [showHelpDialog, setShowHelpDialog] = useState(false);

	const guild = useMemo(() => {
		if (!guilds) return null;
		return guilds.find((guild) => guild.guild_id.toString() === guildId);
	}, [guildId, guilds]);

	const selectedFullGuild = useMemo(() => {
		if (!allGuilds) return null;
		return allGuilds.find((guild) => guild.id === guildId) ?? null;
	}, [allGuilds, guildId]);

	const visibleLinks = links.filter(({ requiresGuildEnabled }) => !requiresGuildEnabled || guild);
	const stripRef = useIndicator(path, visibleLinks.length);

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
			<nav aria-label="Sections" className={cn("flex items-stretch gap-3", className)} {...props}>
				{guildId &&
					(selectedFullGuild && !selectedFullGuild.botAccess ? (
						<Button
							variant="secondary"
							size="sm"
							className="my-auto shrink-0"
							onClick={() => {
								window.dispatchEvent(new Event("openInviteGuildDialog"));
							}}
						>
							<UserPlus />
							Invite LiveLaunch
						</Button>
					) : (
						!guild && (
							<Button
								variant="secondary"
								size="sm"
								className="my-auto shrink-0"
								onClick={() => setShowHelpDialog(true)}
							>
								<Power />
								Enable LiveLaunch
							</Button>
						)
					))}
				<div ref={stripRef} className="ll-scroll relative flex min-w-0 items-stretch overflow-x-auto">
					{visibleLinks.map(({ href, label }) => (
						<RetainQueryLink
							key={`${href}${label}`}
							href={href}
							aria-current={path === href ? "page" : undefined}
							className="inline-flex items-center px-3.5 font-medium font-mono text-[12.5px] text-fg2 hover:text-fg aria-[current=page]:text-fg focus-visible:outline-offset-[-2px]"
						>
							{label}
						</RetainQueryLink>
					))}
					<span
						aria-hidden
						data-indicator
						className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-px bg-brand opacity-0"
					/>
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
						<code className="relative block w-full border border-line2 bg-bg p-3 font-medium font-mono text-[13px]">
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
