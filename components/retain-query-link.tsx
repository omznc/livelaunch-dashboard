'use client';

// components/RetainQueryLink.tsx
import Link, { LinkProps } from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

interface RetainQueryLinkProps extends LinkProps, PropsWithChildren {
	className?: string;
}

const RetainQueryLink = ({
	href,
	className,
	...props
}: RetainQueryLinkProps) => {
	const params = useSearchParams();
	const pathname = typeof href === 'object' ? href.pathname : href;

	const existingQuery = Object.fromEntries(params);

	const query =
		typeof href === 'object' && typeof href.query === 'object'
			? href.query
			: {};

	const hash = typeof href === 'object' ? href.hash : undefined;

	return (
		<Link
			{...props}
			className={className}
			href={{
				pathname: pathname,
				query: {
					...query,
					...existingQuery,
				},
				hash: hash,
			}}
		/>
	);
};
export default RetainQueryLink;
