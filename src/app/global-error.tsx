"use client";
import { Button } from "@components/ui/button";
import { logger } from "@lib/logger";
import { cn } from "@lib/utils";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		logger.error("global-error", "Global application error occurred", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}, [error]);

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn("flex h-screen w-screen flex-col items-center justify-center gap-4", inter.className)}>
				<h1 className="font-bold text-4xl">Something went wrong!</h1>
				<Button onClick={() => reset()}>Try again</Button>
			</body>
		</html>
	);
}
