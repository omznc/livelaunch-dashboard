'use server';

import { AgenciesSettings, Agency } from '@app/(dashboard)/agencies/client';
import prisma from '@lib/prisma';

import { getUserGuilds } from '@lib/discord-api';

export const SetAgencies = async (agencies: Agency[], guildId: string) => {
	const authorized = await getUserGuilds().then(guilds =>
		guilds.find(g => g.id === guildId)
	);

	if (!authorized) {
		throw new Error('Guild not found');
	}

	return Promise.all([
		prisma.ll2_agencies_filter.deleteMany({
			where: {
				guild_id: BigInt(guildId),
				agency_id: {
					in: agencies.filter(a => a.selected).map(a => a.agency_id),
				},
			},
		}),
		prisma.ll2_agencies_filter.createMany({
			data: agencies
				.filter(a => !a.selected)
				.map(a => ({
					guild_id: BigInt(guildId),
					agency_id: a.agency_id,
				})),
			skipDuplicates: true,
		}),
	]);
};

export const updateSettings = async (
	guildId: string,
	settings: AgenciesSettings
): Promise<void> => {
	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			agencies_include_exclude: Number(settings.whitelist),
		},
	});
};
