"use client";

import { Bar } from "@app/(dashboard)/_components/skeleton";
import { cn } from "@lib/utils";
import { usePathname } from "next/navigation";
import { links, tabClass, tabStripClass } from "./navigation";

// The header before its data arrives. Same cells and tab labels as the real header.
export function HeaderSkeleton() {
	const path = usePathname();

	return (
		<header aria-hidden className="material sticky top-0 z-50 border-b border-line">
			<div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-stretch min-[1180px]:border-x min-[1180px]:border-line md:flex-nowrap">
				<div className="flex h-14 min-w-0 flex-1 items-center gap-2 px-4 md:w-[280px] md:flex-none">
					<Bar className="h-6 w-6 shrink-0" />
					<Bar className="h-4 w-28" />
					<Bar className="ml-auto h-4 w-4 shrink-0" />
				</div>
				<div className="flex h-14 w-14 items-center justify-center border-line border-l min-[1100px]:w-[280px] min-[1100px]:justify-between min-[1100px]:px-4 md:order-last">
					<Bar className="hidden h-4 w-4 shrink-0 min-[1100px]:block" />
					<div className="flex items-center gap-2">
						<Bar className="hidden h-4 w-24 min-[1100px]:block" />
						<Bar className="h-6 w-6 shrink-0" />
					</div>
				</div>
				<nav className="order-last flex h-12 w-full items-stretch border-line border-t md:order-none md:h-14 md:flex-1 md:border-t-0 md:border-l">
					<div className={tabStripClass}>
						{links.map(({ href, label }) => (
							<span key={href} className={cn(tabClass)} aria-current={path === href ? "page" : undefined}>
								{label}
							</span>
						))}
					</div>
				</nav>
			</div>
		</header>
	);
}
