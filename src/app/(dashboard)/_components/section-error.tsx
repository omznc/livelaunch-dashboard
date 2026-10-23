"use client";

import { StatusPage } from "@components/status-page";
import { Button } from "@components/ui/button";
import { logger } from "@lib/logger";
import { catchError, type ErrorInfo } from "next/error";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function ErrorView({ error, retry }: ErrorInfo) {
	// catchError has no reset keys. The guild switcher changes only ?g=, so retry when it changes.
	const guild = useSearchParams().get("g");
	const shownFor = useRef(guild);
	useEffect(() => {
		if (guild === shownFor.current) return;
		shownFor.current = guild;
		retry();
	}, [guild, retry]);

	useEffect(() => {
		logger.error("section-error", "Dashboard section error occurred", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}, [error]);

	return (
		<StatusPage title="Something went wrong" description="This section could not load.">
			{/* retry() fetches the page again. reset() would only re-render stale data. */}
			<Button onClick={() => retry()}>Try again</Button>
		</StatusPage>
	);
}

export default catchError((_props: object, info: ErrorInfo) => <ErrorView {...info} />);
