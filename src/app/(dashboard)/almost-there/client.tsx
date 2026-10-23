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
}

export default function AlmostThereClient({ guildName, permissions }: AlmostThereClientProps) {
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

	return (
		<div className="flex flex-col gap-10">
			<div className="flex w-full flex-col gap-8">
				<div className="flex flex-col gap-2">
					<div className="mb-2 flex h-9 w-9 items-center justify-center tint-amber">
						<AlertCircle className="h-4 w-4" />
					</div>
					<h2 className="font-semibold text-2xl tracking-title">Almost There!</h2>
					<p className="mt-1 text-fg2">
						LiveLaunch needs additional permissions in <strong>{guildName}</strong> to work properly. You
						can also just re-invite the bot to your server.
					</p>
				</div>
			</div>

			<SettingGroup
				title="Missing Permissions"
				description={
					<>
						The following Discord permissions are required for LiveLaunch to function properly.{" "}
						<Link
							href="https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ"
							target="_blank"
							className="inline-flex items-center gap-0.5 text-brand hover:underline"
						>
							Learn more <ArrowUpRight className="h-4 w-4" />
						</Link>
					</>
				}
			>
				{permissions.map((permission, index) => (
					<Setting
						key={index}
						label={permission.name}
						description={permission.description}
						active={permission.hasPermission}
					>
						{permission.hasPermission ? (
							<CheckCircle className="h-4 w-4 text-green" />
						) : (
							<XCircle className="h-4 w-4 text-red" />
						)}
					</Setting>
				))}
			</SettingGroup>

			{permissions.some((p) => !p.hasPermission) && (
				<div className="flex w-full flex-col gap-4">
					<div>
						<h3 className="mb-1 font-semibold text-base">How to Fix</h3>
						<p className="mb-4 text-fg2 text-sm">
							Follow these steps to grant the required permissions to the LiveLaunch bot:
						</p>
						<div className="mb-4 border border-line bg-panel p-4">
							<ol className="list-inside list-decimal space-y-2 text-sm">
								<li>Go to your Discord server settings</li>
								<li>Navigate to "Roles" in the left sidebar</li>
								<li>Find the "LiveLaunch" role</li>
								<li>Enable all the permissions listed above</li>
								<li>Click "Save Changes"</li>
								<li>Come back and click "Check Again" below</li>
							</ol>
						</div>
						<div className="flex justify-center">
							<Button
								onClick={handleRefresh}
								disabled={isRefreshing || !canRefresh}
								className="min-w-[140px]"
							>
								{isRefreshing ? (
									<>
										<RefreshCw className="h-4 w-4 animate-spin" />
										Checking...
									</>
								) : (
									<>
										<RefreshCw className="h-4 w-4" />
										Check Again
									</>
								)}
							</Button>
						</div>
						{lastRefresh && !canRefresh && (
							<p className="mt-2 text-center text-fg2 text-sm">
								You can check again in {countdown} second{countdown !== 1 ? "s" : ""}
							</p>
						)}
						<p className="mx-auto mt-2 w-full text-center text-fg2 text-sm md:w-1/2">
							Discord might take a few minutes to update the permissions, so if you don't see the changes
							right away, check back in a few minutes.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
