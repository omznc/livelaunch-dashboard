"use client";

import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

export const useHash = () => {
	const [hash, setHash] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		const handler = () => {
			setHash(window.location.hash);
		};
		handler();

		window.addEventListener("hashchange", handler);
		return () => window.removeEventListener("hashchange", handler);
	}, [mounted]);

	return hash;
};
