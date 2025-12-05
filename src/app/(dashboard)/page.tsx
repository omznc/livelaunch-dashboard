import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { buttonVariants } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import env from "@env";
import { cn } from "@lib/utils";
import PartnerOmznc from "@public/Partner_omznc.jpg";
import PartnerTheSpaceDevs from "@public/Partner_TheSpaceDevs.png";
import { ArrowUp, Hash, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siDiscord, siGithub } from "simple-icons";

export const dynamic = "force-dynamic";

export default async function Home() {
	return (
		<div className="flex flex-col gap-24 pb-8">
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
				<h1 className="inline-flex items-center gap-2 text-center font-bold text-6xl">LiveLaunch Dashboard</h1>
				<p className="inline w-full text-center font-medium text-lg">
					{"Creates space related events and sends news, notifications and live streams! "}
					<Link
						href={"https://juststephen.com/projects/LiveLaunch"}
						className="inline-flex items-center gap-1 brightness-125 hover:underline"
					>
						Learn More <ArrowUp className="rotate-45" />
					</Link>
				</p>
			</div>
			<div className="flex h-full max-h-[300px] w-full flex-wrap items-stretch justify-center gap-4">
				<Card className="flex w-full flex-grow flex-col justify-between md:w-[400px]">
					<CardHeader>
						<CardTitle>LiveLaunch is open source</CardTitle>
						<CardDescription>
							{
								"LiveLaunch is completely open source, both the bot and the dashboard. You can find the source code on GitHub."
							}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-wrap justify-between gap-2">
						<Link
							className={cn(
								buttonVariants({
									variant: "secondary",
								}),
								"inline-flex w-full gap-2 md:w-fit",
							)}
							href={"https://github.com/omznc/livelaunch-dashboard"}
							target={"_blank"}
						>
							<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
								<title>GitHub</title>
								<path d={siGithub.path} />
							</svg>
							Dashboard
							<ArrowUp className="rotate-45" />
						</Link>
						<Link
							className={cn(
								buttonVariants({
									variant: "default",
								}),
								"inline-flex w-full gap-2 md:w-fit",
							)}
							href={"https://github.com/juststephen/livelaunch"}
							target={"_blank"}
						>
							<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
								<title>GitHub</title>
								<path d={siGithub.path} />
							</svg>
							LiveLaunch
							<ArrowUp className="rotate-45" />
						</Link>
					</CardFooter>
				</Card>
				<Card className="flex w-full flex-grow flex-col justify-between md:w-[400px]">
					<CardHeader>
						<CardTitle>Vote for LiveLaunch</CardTitle>
						<CardDescription>
							{`
								Did you know that you can vote for LiveLaunch on top.gg?
								Let's pump those numbers up, these are rookie numbers.
							`}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-wrap justify-end">
						<Link
							className={cn(
								buttonVariants({
									variant: "default",
								}),
								"inline-flex w-full gap-2 md:w-fit",
							)}
							href={`https://top.gg/bot/${env.NEXT_PUBLIC_DISCORD_CLIENT_ID}/vote`}
							target={"_blank"}
						>
							<ThumbsUp />
							Vote
							<ArrowUp className="rotate-45" />
						</Link>
					</CardFooter>
				</Card>
				<Card className="flex w-full flex-grow flex-col justify-between md:w-[400px]">
					<CardHeader>
						<CardTitle>Support</CardTitle>
						<CardDescription>
							Need help? Have a suggestion? Join our Discord, or message a developer.
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-wrap justify-between gap-2">
						<div className="flex w-full gap-2 md:w-fit">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger className={"w-full md:w-fit"}>
										<Link
											className={cn(
												buttonVariants({
													variant: "secondary",
												}),
												"inline-flex w-full gap-2 md:w-fit",
											)}
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
						</div>
						<Link
							className={cn(
								buttonVariants({
									variant: "default",
								}),
								"inline-flex w-full gap-2 md:w-fit",
							)}
							href={"https://discord.gg/nztN2FXe7A"}
							target={"_blank"}
						>
							<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
								<title>Discord</title>
								<path d={siDiscord.path} />
							</svg>
							Discord
							<ArrowUp className="rotate-45" />
						</Link>
					</CardFooter>
				</Card>
				<Card className="flex w-full flex-grow flex-col justify-between md:w-[400px]">
					<CardHeader>
						<CardTitle>Partners</CardTitle>
						<CardDescription>
							{"LiveLaunch is powered by some amazing partners. Check them out!"}
						</CardDescription>
					</CardHeader>
					<CardContent className={"grid grid-cols-2 gap-2"}>
						<HoverCard openDelay={200}>
							<HoverCardTrigger asChild>
								<Link
									href={"https://thespacedevs.com/"}
									target={"_blank"}
									className={
										"w-full overflow-hidden rounded-lg border transition-all hover:brightness-125"
									}
								>
									<Image src={PartnerTheSpaceDevs} alt={"TheSpaceDevs"} placeholder={"blur"} />
								</Link>
							</HoverCardTrigger>
							<HoverCardContent className="flex flex-col gap-4">
								<div className="space-between flex items-center gap-2">
									<h3 className={"font-bold"}>The Space Devs</h3>
								</div>
								<div className={"flex flex-col gap-2"}>
									<p className={"text-sm"}>
										{"The Space Devs were very helpful during the development of LiveLaunch. " +
											"They came up with great ideas for better integration between their LL2 API " +
											"and the LiveLaunch Discord bot. "}
									</p>
									<p className={"text-sm"}>
										{"Perhaps in the future LiveLaunch will have more features " +
											"thanks to the great data from their APIs. "}
									</p>
								</div>
							</HoverCardContent>
						</HoverCard>
						<HoverCard openDelay={200}>
							<HoverCardTrigger asChild>
								<Link
									href={"https://omarzunic.com"}
									target={"_blank"}
									className={
										"w-full overflow-hidden rounded-lg border transition-all hover:brightness-125"
									}
								>
									<Image src={PartnerOmznc} alt={"Omar Zunic"} placeholder={"blur"} />
								</Link>
							</HoverCardTrigger>
							<HoverCardContent className="flex flex-col gap-4">
								<div className="space-between flex items-center gap-2">
									<Avatar>
										<AvatarImage
											src={"https://avatars.githubusercontent.com/u/38432561"}
											alt={"Omar Zunic"}
										/>
										<AvatarFallback>OZ</AvatarFallback>
									</Avatar>
									<h3 className={"font-bold"}>Omar Zunic</h3>
								</div>
								<div className={"flex flex-col gap-2"}>
									<p className={"text-sm"}>
										{
											"A software developer from Bosnia and Herzegovina, and the creator of this dashboard."
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
