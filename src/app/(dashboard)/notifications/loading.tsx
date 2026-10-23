import { controls, SkeletonBadges, SkeletonGroup, SkeletonRow } from "@app/(dashboard)/_components/skeleton";

const filterRow = (label: string) => <SkeletonRow label={label} control={controls.switch} />;

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex flex-col">
			<SkeletonGroup title="w-32" desc={[1, 1]}>
				<SkeletonRow label="w-28" lines={[1, 1]} control={controls.button} />
				<SkeletonRow label="w-40" control={controls.select} />
				<SkeletonRow label="w-40" control={controls.wideButton} />
				<SkeletonBadges />
			</SkeletonGroup>
			<SkeletonGroup title="w-36" desc={[1, 1]}>
				{filterRow("w-28")}
				{filterRow("w-20")}
				{filterRow("w-16")}
			</SkeletonGroup>
			<SkeletonGroup title="w-32" desc={[1, 2]}>
				{filterRow("w-24")}
				{filterRow("w-36")}
				{filterRow("w-12")}
				{filterRow("w-20")}
				{filterRow("w-36")}
				{filterRow("w-40")}
				{filterRow("w-40")}
			</SkeletonGroup>
		</div>
	);
}
