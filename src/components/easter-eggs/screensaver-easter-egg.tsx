"use client";

import { DropdownMenuItem } from "@components/ui/dropdown-menu";
import posthog from "posthog-js";
import { type RefObject, useEffect, useRef, useState } from "react";

const IDLE_MS = 30_000;
const ESC_GAP = 500;
export const SCREENSAVER_DISABLED_KEY = "ll-screensaver-disabled";
export const SCREENSAVER_PREF_EVENT = "screensaverPreferenceChanged";

export function ScreensaverEasterEgg() {
	const timeoutRef = useRef<number | undefined>(undefined);
	const lastEscRef = useRef(0);
	const skipNextActivity = useRef(false);
	const wakeRef = useRef<() => void>(() => {});
	const [screensaver, setScreensaver] = useState(false);
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		const sync = () => setDisabled(localStorage.getItem(SCREENSAVER_DISABLED_KEY) === "1");
		sync();
		window.addEventListener("storage", sync);
		window.addEventListener(SCREENSAVER_PREF_EVENT, sync);
		return () => {
			window.removeEventListener("storage", sync);
			window.removeEventListener(SCREENSAVER_PREF_EVENT, sync);
		};
	}, []);

	useEffect(() => {
		if (disabled) {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
			setScreensaver(false);
			return;
		}

		const startIdleTimer = () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = window.setTimeout(() => {
				setScreensaver(true);
				posthog.capture("easter_egg_screensaver", { trigger: "idle" });
			}, IDLE_MS);
		};

		wakeRef.current = () => {
			setScreensaver(false);
			startIdleTimer();
		};

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				const now = Date.now();
				if (now - lastEscRef.current < ESC_GAP) {
					skipNextActivity.current = true;
					if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
					setScreensaver(true);
					posthog.capture("easter_egg_screensaver", { trigger: "double_escape" });
					return;
				}
				lastEscRef.current = now;
			}
		};

		const onActivity = () => {
			if (skipNextActivity.current) {
				skipNextActivity.current = false;
				return;
			}
			wakeRef.current();
		};

		const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

		window.addEventListener("keydown", onKey);
		for (const event of events) {
			window.addEventListener(event, onActivity);
		}

		startIdleTimer();

		return () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
			window.removeEventListener("keydown", onKey);
			for (const event of events) {
				window.removeEventListener(event, onActivity);
			}
		};
	}, [disabled]);

	if (screensaver) {
		return <Screensaver onExit={() => wakeRef.current()} />;
	}

	return null;
}

export function ScreensaverToggle() {
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		const sync = () => setDisabled(localStorage.getItem(SCREENSAVER_DISABLED_KEY) === "1");
		sync();
		window.addEventListener("storage", sync);
		window.addEventListener(SCREENSAVER_PREF_EVENT, sync);
		return () => {
			window.removeEventListener("storage", sync);
			window.removeEventListener(SCREENSAVER_PREF_EVENT, sync);
		};
	}, []);

	return (
		<DropdownMenuItem
			onClick={() => {
				const next = !disabled;
				if (next) {
					localStorage.setItem(SCREENSAVER_DISABLED_KEY, "1");
				} else {
					localStorage.removeItem(SCREENSAVER_DISABLED_KEY);
				}
				setDisabled(next);
				window.dispatchEvent(new Event(SCREENSAVER_PREF_EVENT));
			}}
		>
			{disabled ? "Enable Screensaver" : "Disable Screensaver"}
		</DropdownMenuItem>
	);
}

function Screensaver({ onExit }: { onExit: () => void }) {
	const bodyRef = useRef<HTMLDivElement>(null);

	return (
		<button
			type="button"
			className="saver-overlay"
			onClick={onExit}
			onMouseMove={onExit}
			onTouchStart={onExit}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onExit();
				}
			}}
		>
			<div className="saver-window">
				<div className="saver-title">
					<span className="h-3 w-3 rounded-full bg-[#8df489]" />
					<span>LiveLaunch OS - Screensaver</span>
					<div className="ml-auto flex items-center gap-1 text-[11px]">
						<span className="inline-flex h-4 w-6 items-center justify-center rounded-sm bg-[#e9f2ff] text-[#0c3ea8] shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">
							_
						</span>
						<span className="inline-flex h-4 w-6 items-center justify-center rounded-sm bg-[#e9f2ff] text-[#0c3ea8] shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">
							▢
						</span>
						<span className="inline-flex h-4 w-6 items-center justify-center rounded-sm bg-[#e9f2ff] text-[#0c3ea8] shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">
							×
						</span>
					</div>
				</div>
				<div className="saver-body" ref={bodyRef}>
					<BouncingRocket containerRef={bodyRef} />
					<div className="saver-body-content space-y-1">
						<p className="text-sm font-semibold text-[#0c2c72]">We're deleting all of your files!!!</p>
						<p className="text-xs text-[#11326b]">
							Just kidding, we're not. Move the mouse to return to the dashboard.
						</p>
					</div>
				</div>
			</div>
		</button>
	);
}

function BouncingRocket({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
	const rocketRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const rocket = rocketRef.current;
		if (!container || !rocket) return;

		const randomSpeed = () => 140 + Math.random() * 140;
		let vx = randomSpeed() * (Math.random() > 0.5 ? 1 : -1);
		let vy = randomSpeed() * (Math.random() > 0.5 ? 1 : -1);
		let x = 0;
		let y = 0;

		const applyTransform = () => {
			const angle = Math.atan2(vy, vx);
			rocket.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
		};

		const placeInBounds = () => {
			const maxX = Math.max(0, container.clientWidth - rocket.clientWidth);
			const maxY = Math.max(0, container.clientHeight - rocket.clientHeight);
			x = maxX ? Math.random() * maxX : 0;
			y = maxY ? Math.random() * maxY : 0;
			applyTransform();
		};

		placeInBounds();

		let last = performance.now();
		let raf = requestAnimationFrame(function step(now) {
			const dt = (now - last) / 1000;
			last = now;

			const maxX = Math.max(0, container.clientWidth - rocket.clientWidth);
			const maxY = Math.max(0, container.clientHeight - rocket.clientHeight);

			x += vx * dt;
			y += vy * dt;

			if (x <= 0) {
				x = 0;
				vx = Math.abs(vx);
			} else if (x >= maxX) {
				x = maxX;
				vx = -Math.abs(vx);
			}

			if (y <= 0) {
				y = 0;
				vy = Math.abs(vy);
			} else if (y >= maxY) {
				y = maxY;
				vy = -Math.abs(vy);
			}

			applyTransform();
			raf = requestAnimationFrame(step);
		});

		const handleResize = () => {
			const maxX = Math.max(0, container.clientWidth - rocket.clientWidth);
			const maxY = Math.max(0, container.clientHeight - rocket.clientHeight);
			x = Math.min(Math.max(0, x), maxX);
			y = Math.min(Math.max(0, y), maxY);
			applyTransform();
		};

		window.addEventListener("resize", handleResize);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", handleResize);
		};
	}, [containerRef]);

	return (
		<div aria-hidden className="saver-rocket" ref={rocketRef}>
			🚀
		</div>
	);
}
