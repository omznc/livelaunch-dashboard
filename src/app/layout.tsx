import "./globals.css";
import Posthog from "@components/posthog";
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

// The app is dark only. This sets the canvas and the scrollbars before the CSS loads.
export const viewport: Viewport = {
	colorScheme: "dark",
	themeColor: "#0b0c0a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`dark ${fontClasses}`}>
			<body>
				<LaunchControlEasterEgg />
				<ScreensaverEasterEgg />
				<ConsoleEasterEgg />
				<Toast />
				<Posthog />
				{children}
			</body>
		</html>
	);
}
