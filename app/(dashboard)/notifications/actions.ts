'use server';

import prisma from '@lib/prisma';
import { CountdownSetting, NotificationsSettings } from '@app/(dashboard)/notifications/client';

export const updateSettings = async (
	guildId: string,
	settings: NotificationsSettings,
): Promise<void> => {
	// remove countdown key

	const data = Object.fromEntries(
		Object.entries(settings).map(([key, value]) => [key, Number(value)]),
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

export const updateCountdown = async (
	guildId: string,
	settings: CountdownSetting,
	minutes?: number,
): Promise<void> => {
	if (minutes) {
		await prisma.notification_countdown.update({
			where: {
				guild_id_minutes: {
					guild_id: BigInt(guildId),
					minutes: minutes,
				},
			},
			data: {
				minutes:
					settings.days * 24 * 60 +
					settings.hours * 60 +
					settings.minutes,
			},
		});
	} else {
		await prisma.notification_countdown.create({
			data: {
				guild_id: BigInt(guildId),
				minutes:
					settings.days * 24 * 60 +
					settings.hours * 60 +
					settings.minutes,
			},
		});
	}
};
