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
import { unwrap } from "@lib/action-result";
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

// The fade at an edge tells that more tabs are out of view.
function updateFades(strip: HTMLElement) {
	const max = strip.scrollWidth - strip.clientWidth;
	strip.toggleAttribute("data-fade-start", strip.scrollLeft > 1);
	strip.toggleAttribute("data-fade-end", strip.scrollLeft < max - 1);
}

function scrollCurrentIntoView(strip: HTMLElement) {
	const current = strip.querySelector<HTMLElement>('[aria-current="page"]');
	if (!current) return;
	strip.scrollLeft = current.offsetLeft - (strip.clientWidth - current.offsetWidth) / 2;
}

function useTabStrip(path: string, count: number) {
	const ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const strip = ref.current;
		if (!strip) return;
		const update = () => updateFades(strip);
		update();
		strip.addEventListener("scroll", update, { passive: true });
		const watch = new ResizeObserver(update);
		watch.observe(strip);
		for (const child of strip.children) watch.observe(child);
		return () => {
			watch.disconnect();
			strip.removeEventListener("scroll", update);
		};
	}, []);

	// The current tab scrolls into view on load and on each change.
	useLayoutEffect(() => {
		if (ref.current) scrollCurrentIntoView(ref.current);
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
	const stripRef = useTabStrip(path, visibleLinks.length);

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
			<nav aria-label="Sections" className={cn("flex items-stretch", className)} {...props}>
				{guildId &&
					(selectedFullGuild && !selectedFullGuild.botAccess ? (
						<div className="flex shrink-0 items-center border-line border-r px-4">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									window.dispatchEvent(new Event("openInviteGuildDialog"));
								}}
							>
								<UserPlus />
								Invite LiveLaunch
							</Button>
						</div>
					) : (
						!guild && (
							<div className="flex shrink-0 items-center border-line border-r px-4">
								<Button variant="secondary" size="sm" onClick={() => setShowHelpDialog(true)}>
									<Power />
									Enable LiveLaunch
								</Button>
							</div>
						)
					))}
				<div
					ref={stripRef}
					className="ll-scroll ll-fade flex min-w-0 flex-1 snap-x items-stretch overflow-x-auto [scrollbar-width:none]"
				>
					{visibleLinks.map(({ href, label }) => (
						<RetainQueryLink
							key={`${href}${label}`}
							href={href}
							aria-current={path === href ? "page" : undefined}
							className="inline-flex shrink-0 snap-start items-center justify-center border-line border-r px-5 font-medium font-mono text-[13.5px] text-fg2 hover:bg-raised hover:text-fg focus-visible:outline-offset-[-2px] motion-reduce:transition-none aria-[current=page]:bg-primary/[0.13] aria-[current=page]:text-brand aria-[current=page]:hover:bg-primary/[0.18]"
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
								toast.promise(unwrap(enableGuild({ guildId: String(guildId) })), {
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
