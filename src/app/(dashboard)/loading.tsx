import { Bar, SkeletonGroup, SkeletonRow } from "@app/(dashboard)/_components/skeleton";

const two = (
	<div className="flex gap-2">
		<Bar className="h-10 w-[150px]" />
		<Bar className="h-10 w-[158px]" />
	</div>
);

// Shaped like the home page. Other routes have their own loading.tsx.
export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<section className="flex flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
				<div className="flex h-[99.8px] flex-col justify-center gap-2 sm:h-[62.4px]">
					<Bar className="h-9 w-full sm:w-96" />
					<Bar className="h-9 w-2/3 sm:hidden" />
				</div>
				<div className="flex max-w-xl flex-col gap-1.5 sm:h-14 sm:justify-center max-sm:h-[84px] max-sm:justify-center">
					<Bar className="h-4 w-full" />
					<Bar className="h-4 w-full" />
					<Bar className="h-4 w-2/3 sm:hidden" />
				</div>
			</section>
			<SkeletonGroup title="w-16">
				<SkeletonRow label="w-28" control={two} />
				<SkeletonRow label="w-16" control={<Bar className="h-10 w-[110px]" />} />
				<SkeletonRow label="w-20" control={two} />
			</SkeletonGroup>
			<SkeletonGroup title="w-24" desc={[1, 1]} plain className="last:border-b-0">
				<div className="grid grid-cols-1 divide-y divide-line border-line border-t border-b sm:grid-cols-2 sm:divide-x sm:divide-y-0">
					<Bar className="aspect-[3/1]" />
					<Bar className="aspect-[3/1]" />
				</div>
			</SkeletonGroup>
		</div>
	);
}
