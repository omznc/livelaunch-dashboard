import type { ReactNode } from "react";

interface StatusPageProps {
	title: string;
	description?: string;
	children?: ReactNode;
}

// A message band for the not found page, the error pages and the empty states. It spans the sheet.
export function StatusPage({ title, description, children }: StatusPageProps) {
	return (
		<div className="my-auto flex w-full flex-col gap-5 border-line border-y px-4 py-12 sm:px-6 sm:py-16">
			<div className="flex max-w-xl flex-col gap-2">
				<h1 className="font-semibold text-3xl leading-9 tracking-title">{title}</h1>
				{description && <p className="text-fg2 text-lg leading-7">{description}</p>}
			</div>
			{children && <div className="flex flex-wrap gap-2">{children}</div>}
		</div>
	);
}
