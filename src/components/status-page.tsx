import type { ReactNode } from "react";

interface StatusPageProps {
	title: string;
	description?: string;
	children?: ReactNode;
}

// A centered message for the not found page, the error pages and the empty states.
export function StatusPage({ title, description, children }: StatusPageProps) {
	return (
		<div className="flex w-full flex-1 flex-col items-start justify-center gap-5 py-16 sm:items-center sm:text-center">
			<div className="flex max-w-md flex-col gap-2">
				<h1 className="font-semibold text-2xl leading-8 tracking-title">{title}</h1>
				{description && <p className="text-fg2">{description}</p>}
			</div>
			{children && <div className="flex flex-wrap gap-2">{children}</div>}
		</div>
	);
}
