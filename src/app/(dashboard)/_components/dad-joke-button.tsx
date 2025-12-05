"use client";

import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import posthog from "posthog-js";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DadJokeButton() {
	const [loading, setLoading] = useState(false);

	const fetchJoke = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const res = await fetch("https://icanhazdadjoke.com/", {
				headers: {
					Accept: "application/json",
					"User-Agent": "LiveLaunch Dashboard",
				},
			});
			if (!res.ok) throw new Error("request failed");
			const data = await res.json();
			const joke = data?.joke || "No joke found.";
			toast(joke);
			posthog.capture("easter_egg_dad_joke", { status: "success", joke });
		} catch {
			toast.error("Couldn't fetch a dad joke.");
			posthog.capture("easter_egg_dad_joke", { status: "error" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<DropdownMenuItem onClick={fetchJoke} disabled={loading}>
			{loading ? "Fetching..." : "Dad joke"}
		</DropdownMenuItem>
	);
}
