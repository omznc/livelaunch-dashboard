"use client";

import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

const THEME_EVENT = "ll-theme-change";

type Choice = "system" | "light" | "dark";

function readChoice(): Choice {
	try {
		const value = localStorage.getItem(THEME_KEY);
		return value === "light" || value === "dark" ? value : "system";
	} catch {
		return "system";
	}
}

function systemTheme() {
	return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme() {
	const choice = readChoice();
	document.documentElement.dataset.theme = choice === "system" ? systemTheme() : choice;
}

function subscribe(onChange: () => void) {
	window.addEventListener("storage", onChange);
	window.addEventListener(THEME_EVENT, onChange);
	return () => {
		window.removeEventListener("storage", onChange);
		window.removeEventListener(THEME_EVENT, onChange);
	};
}

function setChoice(choice: Choice) {
	try {
		if (choice === "system") localStorage.removeItem(THEME_KEY);
		else localStorage.setItem(THEME_KEY, choice);
	} catch {
		// Storage can be blocked. The theme still applies for this page.
	}
	applyTheme();
	window.dispatchEvent(new Event(THEME_EVENT));
}

// Keeps the page in step with the OS setting and with other tabs.
export function ThemeSync() {
	useEffect(() => {
		const media = matchMedia("(prefers-color-scheme: light)");
		const sync = () => applyTheme();
		media.addEventListener("change", sync);
		window.addEventListener("storage", sync);
		return () => {
			media.removeEventListener("change", sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return null;
}

export function ThemeMenu() {
	const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as Choice);
	return (
		<DropdownMenuRadioGroup value={choice} onValueChange={(value) => setChoice(value as Choice)}>
			<DropdownMenuRadioItem value="system" onSelect={(event) => event.preventDefault()}>
				<Monitor className="mr-2 h-[18px] w-[18px]" />
				System
			</DropdownMenuRadioItem>
			<DropdownMenuRadioItem value="light" onSelect={(event) => event.preventDefault()}>
				<Sun className="mr-2 h-[18px] w-[18px]" />
				Light
			</DropdownMenuRadioItem>
			<DropdownMenuRadioItem value="dark" onSelect={(event) => event.preventDefault()}>
				<Moon className="mr-2 h-[18px] w-[18px]" />
				Dark
			</DropdownMenuRadioItem>
		</DropdownMenuRadioGroup>
	);
}
