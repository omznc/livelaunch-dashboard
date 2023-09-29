'use server';

import { AgenciesSettings, Agency } from '@app/(dashboard)/agencies/client';
import prisma from '@lib/prisma';
import { Logger } from 'next-axiom';
import { isAuthorized } from '@lib/server-utils';

const log = new Logger();

export const SetAgencies = async (agencies: Agency[], guildId: string) => {
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	return Promise.all([
		prisma.ll2_agencies_filter.deleteMany({
			where: {
				guild_id: BigInt(guildId),
				agency_id: {
					in: agencies.filter(a => !a.selected).map(a => a.agency_id),
				},
			},
		}),
		prisma.ll2_agencies_filter.createMany({
			data: agencies
				.filter(a => a.selected)
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
	const authorized = await isAuthorized(guildId);
	if (!authorized) {
		throw new Error('Unauthorized');
	}

	await prisma.enabled_guilds.update({
		where: {
			guild_id: BigInt(guildId),
		},
		data: {
			agencies_include_exclude: Number(settings.whitelist),
		},
	});
};
