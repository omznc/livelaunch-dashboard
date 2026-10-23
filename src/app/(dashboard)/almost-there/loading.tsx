import { Bar, controls, SkeletonGroup, SkeletonRow, TextLines } from "@app/(dashboard)/_components/skeleton";

const steps = ["w-56", "w-64", "w-48", "w-72", "w-40", "w-64"];

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<div className="flex flex-col gap-2 px-4 py-8 sm:px-6 sm:py-10">
				<div className="flex h-9 items-center">
					<Bar className="h-6 w-48" />
				</div>
				<div className="max-w-2xl">
					<TextLines lines={[2, 3]} lineClass="h-[23px]" barClass="h-4" />
				</div>
			</div>
			<SkeletonGroup title="w-44" desc={[1, 3]}>
				<SkeletonRow label="w-32" lines={[1, 1]} control={controls.icon} />
				<SkeletonRow label="w-28" control={controls.icon} />
				<SkeletonRow label="w-28" control={controls.icon} />
				<SkeletonRow label="w-28" lines={[1, 1]} control={controls.icon} />
				<SkeletonRow label="w-24" lines={[1, 1]} control={controls.icon} />
			</SkeletonGroup>
			<SkeletonGroup title="w-24" desc={[1, 2]} plain>
				<div className="flex flex-col gap-2 border-line border-t px-4 py-4 sm:px-6 sm:py-5">
					{steps.map((width) => (
						<div key={width} className="flex h-[23px] items-center">
							<Bar className={`h-4 ${width} max-w-full`} />
						</div>
					))}
				</div>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-line border-t px-4 py-4 sm:px-6 sm:py-5">
					<Bar className="h-10 w-[140px]" />
					<div className="basis-full">
						<TextLines lines={[1, 3]} lineClass="h-5" />
					</div>
				</div>
			</SkeletonGroup>
		</div>
	);
}
