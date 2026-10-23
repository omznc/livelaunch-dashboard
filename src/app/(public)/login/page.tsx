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
		<main className="mx-auto flex min-h-[100dvh] w-full max-w-[1180px] flex-col justify-center border-line px-4 min-[1180px]:border-x">
			<div className="relative isolate mx-auto flex w-full max-w-md flex-col gap-6 border border-line bg-panel p-6 sm:p-8">
				<div className="flex flex-col gap-3">
					<h1 className="font-semibold text-4xl leading-[1.04] tracking-display">LiveLaunch Dashboard</h1>
					<p className="text-fg2">
						{"Creates space related events and sends news, notifications and live streams."}
					</p>
				</div>
				<Button className="w-full" size="lg" onClick={handleDiscordSignIn}>
					<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" role="img">
						<title>Discord</title>
						<path d={siDiscord.path} />
					</svg>
					Sign in with Discord
				</Button>
				<p className="text-fg3 text-xs">The dashboard reads your server list to show the servers you manage.</p>
			</div>
		</main>
	);
}
