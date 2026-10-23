import { controls, SkeletonGroup, SkeletonRow } from "@app/(dashboard)/_components/skeleton";

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<SkeletonGroup title="w-20">
				<SkeletonRow label="w-28" lines={[1, 1]} control={controls.button} />
				<SkeletonRow label="w-28" control={controls.select} />
			</SkeletonGroup>
			<SkeletonGroup title="w-24" desc={[1, 2]}>
				<SkeletonRow label="w-24" image control={controls.switch} />
				<SkeletonRow label="w-24" image control={controls.switch} />
				<SkeletonRow label="w-32" image control={controls.switch} />
			</SkeletonGroup>
			<SkeletonGroup title="w-40" desc={[1, 2]}>
				<SkeletonRow label="w-32" lines={[1, 3]} control={controls.number} />
				<SkeletonRow label="w-24" control={controls.switch} />
				<SkeletonRow label="w-20" control={controls.switch} />
				<SkeletonRow label="w-40" control={controls.switch} />
			</SkeletonGroup>
		</div>
	);
}
