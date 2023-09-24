'use server';

import prisma from '@lib/prisma';
import { NewsSitesSettings } from '@app/(dashboard)/news-sites/client';

export async function updateSettings(
	guildId: string,
	settings: NewsSitesSettings,
): Promise<void> {
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			news_include_exclude: Number(settings.whitelist),
		},
	});
}
