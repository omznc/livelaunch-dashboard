import prisma from '@lib/prisma';
import { unstable_cache as cache } from 'next/cache';

export default async function NewsSites() {
	// const newsSites = await prisma.news_sites.findMany();
	const newsSites = await cache(
		async () => prisma.news_sites.findMany(),
		['news-sites'],
		{
			tags: ['news-sites'],
			revalidate: 60 * 60,
		}
	)();

	return (
		<div>
			<h1>News Sites</h1>
			<ul>
				{newsSites.map(site => (
					<li key={site.news_site_id}>{site.news_site_name}</li>
				))}
			</ul>
		</div>
	);
}
