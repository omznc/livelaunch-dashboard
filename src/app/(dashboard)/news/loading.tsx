import { controls, SkeletonGroup, SkeletonList, SkeletonRow } from "@app/(dashboard)/_components/skeleton";

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<SkeletonGroup title="w-16">
				<SkeletonRow label="w-28" lines={[1, 1]} control={controls.button} />
				<SkeletonRow label="w-28" lines={[1, 1]} control={controls.select} />
			</SkeletonGroup>
			<SkeletonGroup title="w-28" desc={[1, 1]}>
				<SkeletonRow label="w-32" lines={[2, 3]} control={controls.tabs} />
			</SkeletonGroup>
			<SkeletonGroup title="w-40" desc={[1, 1]}>
				<SkeletonList />
			</SkeletonGroup>
		</div>
	);
}
