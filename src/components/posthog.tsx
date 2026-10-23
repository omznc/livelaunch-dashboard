"use client";

import posthog from "posthog-js";
import { useEffect } from "react";
import { useSession } from "../lib/auth-client";

export default function Posthog() {
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (isPending) {
			return;
		}
		const user = session?.user;

		const alreadyIdentifiedId = posthog.get_distinct_id();

		if (user && alreadyIdentifiedId !== user.id) {
			posthog.identify(user.id, {
				name: user.name,
			});
			posthog.alias(user.id, alreadyIdentifiedId);
		}
	}, [session, isPending]);

	return null;
}
