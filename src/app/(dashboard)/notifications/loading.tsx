import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div role="status" aria-label="Loading" className="flex w-full items-center justify-center py-24">
			<Loader2 className="h-5 w-5 animate-spin text-fg3" />
		</div>
	);
}
