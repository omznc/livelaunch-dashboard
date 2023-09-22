'use client';

import { cn } from '@/lib/utils';
import RetainQueryLink from '@components/retain-query-link';
import { usePathname } from 'next/navigation';

const links = [
	{
		href: '/',
		label: 'Home',
	},
	{
		href: '/agencies',
		label: 'Agencies',
	},
	{
		href: '/news-sites',
		label: 'News Sites',
	},
];

export function Nav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	const path = usePathname();
	return (
		<nav
			className={cn(
				'flex items-center space-x-4 lg:space-x-6',
				className
			)}
			{...props}
		>
			{links.map(({ href, label }) => (
				<RetainQueryLink
					key={`${href}${label}`}
					href={href}
					className={cn(
						'text-sm font-medium opacity-80 transition-all',
						{
							'font-bold opacity-100': path === href,
						}
					)}
				>
					{label}
				</RetainQueryLink>
			))}
		</nav>
	);
}
