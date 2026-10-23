"use server";

import { prisma } from "@lib/prisma";
import { guildActionClient } from "@lib/safe-actions";
import { refresh } from "next/cache";
import { z } from "zod";

const setAgenciesSchema = z.object({
	guildId: z.string(),
	agencies: z
		.array(
			z.object({
				agency_id: z.number().int().min(0).max(65535),
				selected: z.boolean(),
			}),
		)
		// The client sends every agency, so the cap must stay above the real count
		.max(2000),
});

export const SetAgencies = guildActionClient
	.inputSchema(setAgenciesSchema)
	.action(async ({ parsedInput: { guildId, agencies } }) => {
		const result = await prisma.$transaction([
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

		refresh();
		return result;
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

		refresh();
	});
