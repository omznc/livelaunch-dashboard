"use client";

import { Button } from "@components/ui/button";
import { signIn } from "@lib/auth-client";
import { siDiscord } from "simple-icons";

export default function AuthenticationPage() {
	const handleDiscordSignIn = async () => {
		await signIn.social({
			provider: "discord",
			scopes: ["guilds"],
		});
	};

	return (
		<main className="mx-auto flex min-h-[100dvh] w-full max-w-[1180px] flex-col justify-center border-line min-[1180px]:border-x">
			<div className="flex flex-col gap-4 border-line border-y px-4 py-10 sm:px-6 sm:py-14">
				<h1 className="max-w-xl font-semibold text-4xl leading-[1.08] tracking-display sm:text-5xl">
					LiveLaunch Dashboard
				</h1>
				<p className="max-w-xl text-fg2 text-lg leading-7">
					{"Creates space related events and sends news, notifications and live streams."}
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-line border-b px-4 py-4 sm:px-6 sm:py-5">
				<p className="min-w-0 flex-1 basis-60 text-fg2 text-sm leading-[22px]">
					The dashboard reads your server list to show the servers you manage.
				</p>
				<Button size="lg" className="w-full sm:w-auto" onClick={handleDiscordSignIn}>
					<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" role="img">
						<title>Discord</title>
						<path d={siDiscord.path} />
					</svg>
					Sign in with Discord
				</Button>
			</div>
		</main>
	);
}
