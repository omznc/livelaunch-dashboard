import "./globals.css";
import Posthog from "@components/posthog";
import { ThemeSync } from "@components/theme";
import { themeScript } from "@components/theme-script";
import Toast from "@components/toast";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ConsoleEasterEgg from "@/src/components/easter-eggs/console-easter-egg";
import { LaunchControlEasterEgg } from "../components/easter-eggs/launch-control-easter-egg";
import { ScreensaverEasterEgg } from "../components/easter-eggs/screensaver-easter-egg";
import { fontClasses } from "./fonts";

export const metadata: Metadata = {
	title: "LiveLaunch Dashboard",
	description: "The dashboard for LiveLaunch, a Discord bot.",
};

// Both color schemes are allowed. The theme script picks one before the first paint.
export const viewport: Viewport = {
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
		{ media: "(prefers-color-scheme: dark)", color: "#0b0c0a" },
	],
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={fontClasses} suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string from our own file */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<LaunchControlEasterEgg />
				<ScreensaverEasterEgg />
				<ConsoleEasterEgg />
				<Toast />
				<Posthog />
				<ThemeSync />
				{children}
			</body>
		</html>
	);
}
