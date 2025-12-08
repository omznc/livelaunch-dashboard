import "./globals.css";
import Posthog from "@components/posthog";
import Toast from "@components/toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import ConsoleEasterEgg from "@/src/components/easter-eggs/console-easter-egg";
import { LaunchControlEasterEgg } from "../components/easter-eggs/launch-control-easter-egg";
import { ScreensaverEasterEgg } from "../components/easter-eggs/screensaver-easter-egg";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "LiveLaunch Dashboard",
	description: "The dashboard for LiveLaunch, a Discord bot.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body className={inter.className}>
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
