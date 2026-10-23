import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";

// Skeletons copy the markup of SettingGroup and Setting, so the sizes match the loaded page.
// Line counts are [from sm up, below sm]. They follow the text of the real rows.
export type Lines = readonly [wide: number, narrow: number];

// The pulse stops with prefers-reduced-motion.
export function Bar({ className }: { className?: string }) {
	return <div aria-hidden className={cn("bg-line motion-safe:animate-pulse", className)} />;
}

export function TextLines({
	lines,
	lineClass = "h-[22px]",
	barClass = "h-3.5",
}: {
	lines: Lines;
	lineClass?: string;
	barClass?: string;
}) {
	const [wide, narrow] = lines;
	return Array.from({ length: Math.max(wide, narrow) }, (_, i) => (
		<div
			key={i}
			className={cn("flex items-center", lineClass, i >= wide && "sm:hidden", i >= narrow && "max-sm:hidden")}
		>
			<Bar
				className={cn(
					barClass,
					// The last visible line is short.
					i === narrow - 1 ? "w-2/3" : "w-full",
					i === wide - 1 ? "sm:w-2/3" : "sm:w-full",
				)}
			/>
		</div>
	));
}

export function SkeletonGroup({
	desc,
	title = "w-28",
	plain,
	className,
	children,
}: {
	desc?: Lines;
	title?: string;
	// Skip the divided row container, for content that has its own hairline.
	plain?: boolean;
	className?: string;
	children?: ReactNode;
}) {
	return (
		<section className={cn("flex flex-col border-line border-t first:border-t-0 last:border-b", className)}>
			<div className="flex flex-col gap-1 px-4 pt-6 pb-4 sm:px-6">
				<div className="flex h-7 items-center gap-1.5">
					<Bar className="h-[18px] w-[18px]" />
					<Bar className={cn("h-5", title)} />
				</div>
				{desc && (
					<div className="flex flex-col">
						<TextLines lines={desc} lineClass="h-[22px]" barClass="h-3.5" />
					</div>
				)}
			</div>
			{plain ? (
				children
			) : (
				<div className="flex flex-col divide-y divide-line border-line border-t">{children}</div>
			)}
		</section>
	);
}

export const controls = {
	switch: <Bar className="h-6 w-11" />,
	select: <Bar className="h-10 w-32" />,
	button: <Bar className="h-10 w-[90px]" />,
	wideButton: <Bar className="h-10 w-[154px]" />,
	tabs: <Bar className="h-10 w-[171px]" />,
	number: <Bar className="h-10 w-32" />,
	icon: <Bar className="h-[18px] w-[18px]" />,
};

export function SkeletonRow({
	label = "w-32",
	lines = [1, 2],
	image,
	control,
}: {
	label?: string;
	lines?: Lines;
	image?: boolean;
	control: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
			<div className="flex min-w-0 flex-1 basis-60 items-center gap-4">
				{image && <Bar className="h-8 w-8 shrink-0" />}
				<div className="flex min-w-0 max-w-lg flex-1 flex-col gap-0.5">
					<div className="flex h-6 items-center">
						<Bar className={cn("h-4", label)} />
					</div>
					<div>
						<TextLines lines={lines} lineClass="h-[22px]" barClass="h-3.5" />
					</div>
				</div>
			</div>
			<div className="shrink-0">{control}</div>
		</div>
	);
}

// The list of current countdowns in the notification group.
export function SkeletonBadges() {
	return (
		<div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
			<div className="flex h-[23px] items-center">
				<Bar className="h-4 w-44" />
			</div>
			<div className="flex flex-wrap gap-2">
				<Bar className="h-[33px] w-[92px]" />
				<Bar className="h-[33px] w-[84px]" />
				<Bar className="h-[33px] w-[92px]" />
			</div>
		</div>
	);
}

// The search box and the table of agencies or news sites.
export function SkeletonList({ rows = 10 }: { rows?: number }) {
	return (
		<>
			<div className="flex h-12 items-center border-line border-b px-4 sm:px-6">
				<Bar className="h-4 w-20" />
			</div>
			<div className="flex flex-col">
				<Table className="w-full">
					<TableHeader className="border-b border-line">
						<TableRow className="hover:bg-transparent">
							<TableHead>
								<Bar className="h-4 w-12" />
							</TableHead>
							<TableHead className="pr-0 sm:last:pr-0">
								<Bar className="m-2 h-5 w-5" />
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rows }, (_, i) => (
							<TableRow key={i} className="hover:bg-transparent">
								<TableCell>
									<div className="flex items-center gap-3">
										<Bar className="h-8 w-8 shrink-0" />
										<Bar className="h-4 w-40" />
									</div>
								</TableCell>
								<TableCell className="w-12 pr-0 last:pr-0 sm:last:pr-0">
									<Bar className="m-2 h-5 w-5" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
