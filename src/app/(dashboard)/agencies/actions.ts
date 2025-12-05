"use server";

import { prisma } from "@lib/prisma";
import { guildActionClient } from "@lib/safe-actions";
import { z } from "zod";

const setAgenciesSchema = z.object({
	guildId: z.string(),
	agencies: z.array(
		z.object({
			agency_id: z.number(),
			selected: z.boolean(),
		}),
	),
});

export const SetAgencies = guildActionClient
	.inputSchema(setAgenciesSchema)
	.action(async ({ parsedInput: { guildId, agencies } }) => {
		return Promise.all([
			prisma.ll2_agencies_filter.deleteMany({
				where: {
					guild_id: BigInt(guildId),
					agency_id: {
						in: agencies.filter((a) => !a.selected).map((a) => a.agency_id),
					},
				},
			}),
			prisma.ll2_agencies_filter.createMany({
				data: agencies
					.filter((a) => a.selected)
					.map((a) => ({
						guild_id: BigInt(guildId),
						agency_id: a.agency_id,
					})),
				skipDuplicates: true,
			}),
		]);
	});

const agenciesSettingsSchema = z.object({
	guildId: z.string(),
	settings: z.object({
		whitelist: z.union([z.string(), z.number(), z.boolean()]),
	}),
});

export const updateSettings = guildActionClient
	.inputSchema(agenciesSettingsSchema)
	.action(async ({ parsedInput: { guildId, settings } }) => {
		await prisma.enabled_guilds.update({
			where: {
				guild_id: BigInt(guildId),
			},
			data: {
				agencies_include_exclude: Number(settings.whitelist),
			},
		});
	});
