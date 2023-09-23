'use server';

import prisma from '@lib/prisma';
import { GeneralSettings } from '@app/(dashboard)/general/client';
import { NotificationsSettings } from '@app/(dashboard)/notifications/client';

export const updateSettings = async (
	guildId: string,
	settings: NotificationsSettings
): Promise<void> => {
	// remove countdown key
	const { countdown, ..._settings } = settings;

	const data = Object.fromEntries(
		Object.entries(_settings).map(([key, value]) => [key, Number(value)])
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
