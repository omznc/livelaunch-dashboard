"use client";

import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function LaunchControlReset() {
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
