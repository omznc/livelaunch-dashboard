"use client";

import { Button } from "@components/ui/button";
import { logger } from "@lib/logger";
import { catchError, type ErrorInfo } from "next/error";
import { useEffect } from "react";

function ErrorView({ error, retry }: ErrorInfo) {
	useEffect(() => {
		logger.error("section-error", "Dashboard section error occurred", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}, [error]);

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 py-12">
			<h1 className="font-bold text-4xl">Something went wrong!</h1>
			{/* retry() fetches the page again. reset() would only re-render stale data. */}
			<Button onClick={() => retry()}>Try again</Button>
		</div>
	);
}

export default catchError((_props: object, info: ErrorInfo) => <ErrorView {...info} />);
