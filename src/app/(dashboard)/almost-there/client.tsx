"use client";

import { Button } from "@components/ui/button";
import { Setting, SettingGroup } from "@components/ui/setting";
import type { PermissionStatus } from "@lib/discord-api";
import { AlertCircle, ArrowUpRight, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AlmostThereClientProps {
	guildName: string;
	permissions: PermissionStatus[];
	lookupFailed: boolean;
}

export default function AlmostThereClient({ guildName, permissions, lookupFailed }: AlmostThereClientProps) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState<number | null>(null);
	const [countdown, setCountdown] = useState<number>(0);
	const router = useRouter();

	const handleRefresh = async () => {
		if (countdown > 0) {
			toast.error(`You can refresh again in ${countdown} second${countdown !== 1 ? "s" : ""}`);
			return;
		}

		setIsRefreshing(true);
		const now = Date.now();
		setLastRefresh(now);

		try {
			router.refresh();
		} finally {
			setTimeout(() => setIsRefreshing(false), 1000);
		}
	};

	// Initialize countdown on component mount
	useEffect(() => {
		if (lastRefresh) {
			const now = Date.now();
			const timePassed = now - lastRefresh;
			const remaining = Math.max(0, 30000 - timePassed);
			setCountdown(Math.ceil(remaining / 1000));
		}
	}, [lastRefresh]); // Only run once on mount

	// Update countdown timer every second
	useEffect(() => {
		if (!lastRefresh) return;

		const interval = setInterval(() => {
			const now = Date.now();
			const timePassed = now - lastRefresh;
			const remaining = Math.max(0, 30000 - timePassed);

			setCountdown(Math.ceil(remaining / 1000));

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [lastRefresh]);

	const canRefresh = countdown === 0;
	const refreshButton = (
		<Button onClick={handleRefresh} disabled={isRefreshing || !canRefresh}>
			<RefreshCw className={isRefreshing ? "animate-spin" : undefined} />
			{isRefreshing ? "Checking..." : "Check Again"}
		</Button>
	);
	const refreshNote = lastRefresh && !canRefresh && (
		<p className="text-fg2 text-sm">
			You can check again in {countdown} second{countdown !== 1 ? "s" : ""}
		</p>
	);

	return (
		<div className="flex flex-col">
			<div className="flex flex-col gap-2 px-4 py-8 sm:px-6 sm:py-10">
				<h1 className="font-semibold text-3xl leading-9 tracking-title">Almost There</h1>
				<p className="max-w-2xl text-fg2">
					{lookupFailed ? (
						<>Could not check the permissions of LiveLaunch in {guildName}.</>
					) : (
						<>
							LiveLaunch needs more permissions in <strong className="text-fg">{guildName}</strong> to
							work. You can also re-invite the bot to your server.
						</>
					)}
				</p>
			</div>

			{lookupFailed ? (
				<section className="flex flex-col border-line border-t border-b">
					<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
						<div className="flex min-w-0 flex-1 basis-60 items-center gap-4">
							<AlertCircle className="h-[18px] w-[18px] shrink-0 text-amber" />
							<p role="alert">{"Could not check the bot's permissions. Try again later."}</p>
						</div>
						<div className="flex shrink-0 items-center gap-4">
							{refreshNote}
							{refreshButton}
						</div>
					</div>
				</section>
			) : (
				<>
					<SettingGroup
						title="Missing Permissions"
						description={
							<>
								These Discord permissions are required for LiveLaunch to work.{" "}
								<Link
									href="https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ"
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-0.5 text-brand hover:underline"
								>
									Learn more <ArrowUpRight className="h-[18px] w-[18px]" />
								</Link>
							</>
						}
					>
						{permissions.map((permission) => (
							<Setting
								key={permission.name}
								label={permission.name}
								description={permission.description}
								active={permission.hasPermission}
							>
								{permission.hasPermission ? (
									<CheckCircle className="h-[18px] w-[18px] text-green" aria-label="Granted" />
								) : (
									<XCircle className="h-[18px] w-[18px] text-red" aria-label="Missing" />
								)}
							</Setting>
						))}
					</SettingGroup>

					{permissions.some((p) => !p.hasPermission) && (
						<section className="flex flex-col border-line border-t border-b">
							<div className="flex flex-col gap-1 px-4 pt-6 pb-4 sm:px-6">
								<h2 className="font-semibold text-lg leading-7 tracking-head">How to fix</h2>
								<p className="text-fg2 text-sm leading-[22px]">
									Follow these steps to give the LiveLaunch bot the permissions.
								</p>
							</div>
							<ol className="list-inside list-decimal space-y-2 border-line border-t px-4 py-4 sm:px-6 sm:py-5">
								<li>Go to your Discord server settings</li>
								<li>Navigate to "Roles" in the left sidebar</li>
								<li>Find the "LiveLaunch" role</li>
								<li>Enable all the permissions listed above</li>
								<li>Click "Save Changes"</li>
								<li>Come back and click "Check Again" below</li>
							</ol>
							<div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-line border-t px-4 py-4 sm:px-6 sm:py-5">
								{refreshButton}
								{refreshNote}
								<p className="basis-full text-fg2 text-sm">
									Discord can take a few minutes to update the permissions. If you do not see the
									change, check back later.
								</p>
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
}
