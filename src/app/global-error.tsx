"use client";
import "./globals.css";
import { StatusPage } from "@components/status-page";
import { themeScript } from "@components/theme-script";
import { Button } from "@components/ui/button";
import { logger } from "@lib/logger";
import { useEffect } from "react";
import { fontClasses } from "./fonts";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		logger.error("global-error", "Global application error occurred", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}, [error]);

	return (
		<html lang="en" className={fontClasses} suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string from our own file */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col border-line min-[1180px]:border-x">
					<StatusPage title="Something went wrong" description="An unexpected error stopped this page.">
						<Button onClick={() => reset()}>Try again</Button>
					</StatusPage>
				</main>
			</body>
		</html>
	);
}
