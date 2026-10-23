"use client";
import "./globals.css";
import { StatusPage } from "@components/status-page";
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
		<html lang="en" className={`dark ${fontClasses}`} suppressHydrationWarning>
			<body>
				<main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col border-line px-4 min-[1180px]:border-x">
					<StatusPage title="Something went wrong" description="An unexpected error stopped this page.">
						<Button onClick={() => reset()}>Try again</Button>
					</StatusPage>
				</main>
			</body>
		</html>
	);
}
