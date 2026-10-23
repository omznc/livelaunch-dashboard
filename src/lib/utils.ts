import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

// Turns a number field into an integer from 0 to max. An empty field gives 0.
export function boundedValue(input: HTMLInputElement, max: number) {
	const raw = input.valueAsNumber;
	if (Number.isNaN(raw)) return 0;
	const value = clamp(Math.trunc(raw), 0, max);
	if (value !== raw) input.value = String(value);
	return value;
}
