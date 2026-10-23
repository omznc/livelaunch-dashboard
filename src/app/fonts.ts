import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

const sans = Instrument_Sans({
	subsets: ["latin", "latin-ext"],
	variable: "--font-instrument-sans",
});
const mono = JetBrains_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-jetbrains-mono",
});

// Sets the font variables on <html>. The global error page needs them too.
export const fontClasses = `${sans.variable} ${mono.variable}`;
