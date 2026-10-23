import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { buttonVariants } from "@components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import env from "@env";
import PartnerOmznc from "@public/Partner_omznc.jpg";
import PartnerTheSpaceDevs from "@public/Partner_TheSpaceDevs.png";
import { ArrowUpRight, Hash, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siDiscord, siGithub } from "simple-icons";

function BrandIcon({ title, path }: { title: string; path: string }) {
	return (
		<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" role="img">
			<title>{title}</title>
			<path d={path} />
		</svg>
	);
}

function LinkRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
			<div className="flex min-w-0 flex-col gap-0.5">
				<h2 className="font-medium text-sm leading-5">{title}</h2>
				<p className="text-fg2 text-sm">{description}</p>
			</div>
			<div className="flex shrink-0 flex-wrap gap-2">{children}</div>
		</div>
	);
}

export default async function Home() {
	const secondary = buttonVariants({ variant: "secondary" });
	const primary = buttonVariants({ variant: "default" });

	return (
		<div className="flex flex-col gap-12">
			<section className="relative isolate flex flex-col gap-4 pt-4 pb-2">
				{/* The only accent glow on the page. */}
				<div
					aria-hidden
					className="-z-10 pointer-events-none absolute -top-16 -left-24 h-64 w-[28rem] max-w-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]"
				/>
				<h1 className="font-semibold text-5xl leading-[1.04] tracking-display sm:text-6xl">
					LiveLaunch Dashboard
				</h1>
				<p className="max-w-xl text-fg2 text-base leading-6">
					{"Creates space related events and sends news, notifications and live streams. "}
					<Link
						href={"https://juststephen.com/projects/LiveLaunch"}
						className="inline-flex items-center gap-0.5 text-brand underline-offset-4 hover:underline"
					>
						Learn more <ArrowUpRight className="h-4 w-4" />
					</Link>
				</p>
			</section>

			<section className="flex flex-col gap-2">
				<h2 className="font-semibold text-sm">Links</h2>
				<div className="flex flex-col divide-y divide-line border border-line bg-panel">
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
						<Link
							className={secondary}
							href={`https://top.gg/bot/${env.DISCORD_CLIENT_ID}/vote`}
							target={"_blank"}
							rel="noreferrer"
						>
							<ThumbsUp />
							Vote
							<ArrowUpRight />
						</Link>
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
						<Link
							className={primary}
							href={"https://discord.gg/nztN2FXe7A"}
							target={"_blank"}
							rel="noreferrer"
						>
							<BrandIcon title="Discord" path={siDiscord.path} />
							Discord
							<ArrowUpRight />
						</Link>
					</LinkRow>
				</div>
			</section>

			<section className="flex flex-col gap-2">
				<h2 className="font-semibold text-sm">Partners</h2>
				<p className="text-fg2 text-sm">LiveLaunch is powered by some amazing partners.</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<HoverCard openDelay={200}>
						<HoverCardTrigger asChild>
							<Link
								href={"https://thespacedevs.com/"}
								target={"_blank"}
								rel="noreferrer"
								className="relative block aspect-[3/1] overflow-hidden border border-line bg-panel hover:border-line2"
							>
								<Image
									src={PartnerTheSpaceDevs}
									alt={"TheSpaceDevs"}
									placeholder={"blur"}
									fill
									sizes="(min-width: 640px) 560px, 100vw"
									className="object-cover"
								/>
							</Link>
						</HoverCardTrigger>
						<HoverCardContent className="flex flex-col gap-3">
							<h3 className={"font-semibold text-sm"}>The Space Devs</h3>
							<p className={"text-fg2 text-sm"}>
								{"The Space Devs were very helpful during the development of LiveLaunch. " +
									"They came up with great ideas for better integration between their LL2 API " +
									"and the LiveLaunch Discord bot. "}
							</p>
							<p className={"text-fg2 text-sm"}>
								{"Perhaps in the future LiveLaunch will have more features " +
									"thanks to the great data from their APIs. "}
							</p>
						</HoverCardContent>
					</HoverCard>
					<HoverCard openDelay={200}>
						<HoverCardTrigger asChild>
							<Link
								href={"https://omarzunic.com"}
								target={"_blank"}
								rel="noreferrer"
								className="relative block aspect-[3/1] overflow-hidden border border-line bg-panel hover:border-line2"
							>
								<Image
									src={PartnerOmznc}
									alt={"Omar Zunic"}
									placeholder={"blur"}
									fill
									sizes="(min-width: 640px) 560px, 100vw"
									className="object-cover"
								/>
							</Link>
						</HoverCardTrigger>
						<HoverCardContent className="flex flex-col gap-3">
							<div className="flex items-center gap-2">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={"https://avatars.githubusercontent.com/u/38432561"}
										alt={"Omar Zunic"}
									/>
									<AvatarFallback>OZ</AvatarFallback>
								</Avatar>
								<h3 className={"font-semibold text-sm"}>Omar Zunic</h3>
							</div>
							<p className={"text-fg2 text-sm"}>
								{"A software developer from Bosnia and Herzegovina, and the creator of this dashboard."}
							</p>
						</HoverCardContent>
					</HoverCard>
				</div>
			</section>
		</div>
	);
}
