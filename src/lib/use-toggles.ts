"use client";

import { errorMessage, unwrap } from "@lib/action-result";
import { useState } from "react";
import toast from "react-hot-toast";

// State for a set of switches. A change shows at once and saves in the background.
// If the save fails, the switch goes back to the old value and a toast shows the error.
export function useToggles<T extends object>(initial: T, save: (next: T) => Parameters<typeof unwrap>[0]) {
	const [settings, setSettings] = useState<T>(initial);

	const set = <K extends keyof T>(key: K, value: T[K]) => {
		const previous = settings[key];
		setSettings((prev) => ({ ...prev, [key]: value }));
		unwrap(save({ ...settings, [key]: value })).catch((error) => {
			setSettings((prev) => ({ ...prev, [key]: previous }));
			toast.error(errorMessage(error));
		});
	};

	return [settings, set] as const;
}
