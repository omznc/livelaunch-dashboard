'use server';

import prisma from '@lib/prisma';
import { GeneralSettings } from '@app/(dashboard)/general/client';

export const updateSettings = async (
	guildId: string,
	settings: GeneralSettings
): Promise<void> => {
	const data = Object.fromEntries(
		Object.entries(settings).map(([key, value]) => [key, Number(value)])
	);
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			...data,
		},
	});
};
