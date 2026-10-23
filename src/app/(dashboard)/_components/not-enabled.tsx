"use client";

import { StatusPage } from "@components/status-page";
import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotEnabled() {
	const [mounted, setMounted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (mounted) {
			window.dispatchEvent(new Event("showHelpDialog"));
		}
		setMounted(true);
	}, [mounted]);

	return (
		<StatusPage
			title="This guild is not enabled"
			description="You cannot use LiveLaunch until you enable it for this guild."
		>
			<Button
				variant="outline"
				onClick={() => {
					router.push("/");
				}}
			>
				Home
			</Button>
			<Button
				onClick={() => {
					window.dispatchEvent(new Event("showHelpDialog"));
				}}
			>
				Enable
			</Button>
		</StatusPage>
	);
}
