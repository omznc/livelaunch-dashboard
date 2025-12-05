import "./globals.css";
import ConsoleEasterEgg from "@components/console-easter-egg";
import EasterEggs from "@components/easter-eggs";
import Posthog from "@components/posthog";
import Toast from "@components/toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "LiveLaunch Dashboard",
	description: "The dashboard for LiveLaunch, a Discord bot.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body className={inter.className}>
				<EasterEggs />
				<ConsoleEasterEgg />
				<Toast />
				<Posthog />
				{children}
			</body>
		</html>
	);
}
