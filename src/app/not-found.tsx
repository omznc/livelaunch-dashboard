import { StatusPage } from "@components/status-page";
import { buttonVariants } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Requests without access to a guild also end up here.
export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col border-line px-4 min-[1180px]:border-x">
			<StatusPage title="Page not found" description="This page does not exist, or you do not have access to it.">
				<Link href="/" className={buttonVariants({ variant: "default" })}>
					<ArrowLeft />
					Back to the dashboard
				</Link>
			</StatusPage>
		</main>
	);
}
