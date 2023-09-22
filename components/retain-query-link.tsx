'use client';

// components/RetainQueryLink.tsx
import Link, { LinkProps } from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

const RetainQueryLink = ({
	href,
	className,
	...props
}: LinkProps & { className?: string } & PropsWithChildren) => {
	// 1. use useRouter hook to get access to the current query params
	const router = useRouter();
	const params = useSearchParams();

	// 2. get the pathname
	const pathname = typeof href === 'object' ? href.pathname : href;

	// 3. get the query from props
	const query =
		typeof href === 'object' && typeof href.query === 'object'
			? href.query
			: {};

	// 4. get the query from useSearchParams
	const existingQuery = Object.fromEntries(params);

	// 5. get any #hash from the href
	const hash = typeof href === 'object' ? href.hash : undefined;

	return (
		<Link
			{...props}
			className={className}
			href={{
				pathname: pathname,
				// combine router.query and query props
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
