"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";

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

export default function EasterEggs() {
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
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return null;
}
