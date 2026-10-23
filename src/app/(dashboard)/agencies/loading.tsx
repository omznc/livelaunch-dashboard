import { controls, SkeletonGroup, SkeletonList, SkeletonRow } from "@app/(dashboard)/_components/skeleton";

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<SkeletonGroup title="w-28" desc={[1, 1]}>
				<SkeletonRow label="w-32" lines={[2, 3]} control={controls.tabs} />
			</SkeletonGroup>
			<SkeletonGroup title="w-36" desc={[1, 1]}>
				<SkeletonList />
			</SkeletonGroup>
		</div>
	);
}
