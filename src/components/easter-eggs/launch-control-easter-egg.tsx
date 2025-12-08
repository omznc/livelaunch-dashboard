"use client";

import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

const SEQ = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

export function LaunchControlEasterEgg() {
	const buffer = useRef<string[]>([]);

	useEffect(() => {
		const html = document.documentElement;

		if (localStorage.getItem("ll-launch-control") === "1") {
			html.classList.add("launch-control");
		}

		const onKey = (e: KeyboardEvent) => {
			buffer.current = [...buffer.current.slice(-(SEQ.length - 1)), e.key];
			if (buffer.current.join(",") === SEQ.join(",")) {
				const on = html.classList.toggle("launch-control");
				localStorage.setItem("ll-launch-control", on ? "1" : "0");
				posthog.capture("easter_egg_konami_toggle", { on });
			}
		};

		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
		};
	}, []);

	return null;
}

export function LaunchControlResetEasterEgg() {
	const [active, setActive] = useState(false);

	useEffect(() => {
		const check = () =>
			document.documentElement.classList.contains("launch-control") ||
			localStorage.getItem("ll-launch-control") === "1";
		const handler = () => setActive(check());
		handler();
		window.addEventListener("keydown", handler);
		window.addEventListener("storage", handler);
		document.addEventListener("visibilitychange", handler);
		return () => {
			window.removeEventListener("keydown", handler);
			window.removeEventListener("storage", handler);
			document.removeEventListener("visibilitychange", handler);
		};
	}, []);

	if (!active) return null;

	return (
		<DropdownMenuItem
			onClick={() => {
				document.documentElement.classList.remove("launch-control");
				localStorage.removeItem("ll-launch-control");
				setActive(false);
			}}
		>
			Disable Launch Control
		</DropdownMenuItem>
	);
}
