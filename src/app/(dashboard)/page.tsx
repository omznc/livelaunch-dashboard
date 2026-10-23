import { buttonVariants } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import env from "@env";
import { redirectToDefaultGuild } from "@lib/server-utils";
import PartnerOmznc from "@public/Partner_omznc.jpg";
import PartnerTheSpaceDevs from "@public/Partner_TheSpaceDevs.png";
import { ArrowUpRight, Hash, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";
import { siDiscord, siGithub } from "simple-icons";

function BrandIcon({ title, path }: { title: string; path: string }) {
	return (
		<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" role="img">
			<title>{title}</title>
			<path d={path} />
		</svg>
	);
}

// A band with a hairline above it. Its heading lines up with the rows below it.
function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
	return (
		<section className="flex flex-col border-line border-t">
			<div className="flex flex-col gap-1 px-4 pt-6 pb-4 sm:px-6">
				<h2 className="font-semibold text-lg leading-7 tracking-head">{title}</h2>
				{description && <p className="text-fg2 text-sm leading-[22px]">{description}</p>}
			</div>
			{children}
		</section>
	);
}

function LinkRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-line border-t px-4 py-4 sm:px-6 sm:py-5">
			<div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
				<h3 className="font-medium text-[15px] leading-6">{title}</h3>
				<p className="text-fg2 text-sm leading-[22px]">{description}</p>
			</div>
			<div className="flex shrink-0 flex-wrap gap-2">{children}</div>
		</div>
	);
}

// Reads the query behind its own boundary, so the rest of the page stays static.
async function GuildRedirect({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
	return redirectToDefaultGuild("/", (await searchParams).g);
}

function VoteLink({ clientId }: { clientId?: string }) {
	return (
		<Link
			className={buttonVariants({ variant: "secondary" })}
			href={clientId ? `https://top.gg/bot/${clientId}/vote` : "https://top.gg/search?q=LiveLaunch"}
			target={"_blank"}
			rel="noreferrer"
		>
			<ThumbsUp />
			Vote
			<ArrowUpRight />
		</Link>
	);
}

// The client ID is a runtime value. Read it after connection(), so the build does not freeze it.
async function DynamicVoteLink() {
	await connection();
	return <VoteLink clientId={env.DISCORD_CLIENT_ID} />;
}

export default function Home(props: { searchParams: Promise<{ g?: string }> }) {
	const secondary = buttonVariants({ variant: "secondary" });
	const primary = buttonVariants({ variant: "default" });

	return (
		<div className="flex flex-col">
			<Suspense fallback={null}>
				<GuildRedirect searchParams={props.searchParams} />
			</Suspense>
			<section className="relative isolate flex flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
				{/* The only accent glow on the page. On a light background it looks like a stain, so it is off. */}
				<div
					aria-hidden
					className="-z-10 pointer-events-none absolute in-data-[theme=light]:hidden -top-16 -left-24 h-64 w-[28rem] max-w-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]"
				/>
				<h1 className="font-semibold text-5xl leading-[1.04] tracking-display sm:text-6xl">
					LiveLaunch Dashboard
				</h1>
				<p className="max-w-xl text-fg2 text-lg leading-7">
					{"Creates space related events and sends news, notifications and live streams. "}
					<Link
						href={"https://juststephen.com/projects/LiveLaunch"}
						target={"_blank"}
						rel="noreferrer"
						className="inline-flex items-center gap-0.5 text-brand underline-offset-4 hover:underline"
					>
						Learn more <ArrowUpRight className="h-[18px] w-[18px]" />
					</Link>
				</p>
			</section>

			<Section title="Links">
				<LinkRow
					title="Open source"
					description="Both the bot and the dashboard are open source. Find the code on GitHub."
				>
					<Link
						className={secondary}
						href={"https://github.com/omznc/livelaunch-dashboard"}
						target={"_blank"}
						rel="noreferrer"
					>
						<BrandIcon title="GitHub" path={siGithub.path} />
						Dashboard
						<ArrowUpRight />
					</Link>
					<Link
						className={secondary}
						href={"https://github.com/juststephen/livelaunch"}
						target={"_blank"}
						rel="noreferrer"
					>
						<BrandIcon title="GitHub" path={siGithub.path} />
						LiveLaunch
						<ArrowUpRight />
					</Link>
				</LinkRow>
				<LinkRow title="Vote" description="Vote for LiveLaunch on top.gg to help more people find it.">
					<Suspense fallback={<VoteLink />}>
						<DynamicVoteLink />
					</Suspense>
				</LinkRow>
				<LinkRow
					title="Support"
					description="Need help or have a suggestion? Join the Discord, or message a developer."
				>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									className={secondary}
									href={"discord://-/channels/151026584164237312/967838544766836777"}
								>
									<Hash />
									support
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p>This only works if you are in the server.</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<Link className={primary} href={"https://discord.gg/nztN2FXe7A"} target={"_blank"} rel="noreferrer">
						<BrandIcon title="Discord" path={siDiscord.path} />
						Discord
						<ArrowUpRight />
					</Link>
				</LinkRow>
			</Section>

			<Section title="Partners" description="LiveLaunch is powered by some amazing partners.">
				<div className="grid grid-cols-1 divide-y divide-line border-line border-t border-b sm:grid-cols-2 sm:divide-x sm:divide-y-0">
					<Link
						href={"https://thespacedevs.com/"}
						target={"_blank"}
						rel="noreferrer"
						className="relative block aspect-[3/1] overflow-hidden hover:brightness-110 focus-visible:outline-offset-[-2px]"
					>
						{/* The PNG has rounded corners. A 5% scale pushes them outside the cell. */}
						<Image
							src={PartnerTheSpaceDevs}
							alt={"The Space Devs"}
							placeholder={"blur"}
							fill
							sizes="(min-width: 1180px) 590px, (min-width: 640px) 50vw, 100vw"
							className="scale-[1.05] object-cover"
						/>
					</Link>
					<Link
						href={"https://omarzunic.com"}
						target={"_blank"}
						rel="noreferrer"
						className="relative block aspect-[3/1] overflow-hidden hover:brightness-110 focus-visible:outline-offset-[-2px]"
					>
						<Image
							src={PartnerOmznc}
							alt={"Omar Zunic"}
							placeholder={"blur"}
							fill
							sizes="(min-width: 1180px) 590px, (min-width: 640px) 50vw, 100vw"
							className="object-cover"
						/>
					</Link>
				</div>
			</Section>
		</div>
	);
}
