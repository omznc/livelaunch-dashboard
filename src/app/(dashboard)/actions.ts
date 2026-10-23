"use server";

import { getBotGuilds } from "@lib/discord-api";
import { prisma } from "@lib/prisma";
import { actionClient, guildActionClient } from "@lib/safe-actions";
import { isAuthorized } from "@lib/server-utils";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";

export const revalidateGuilds = actionClient.inputSchema(z.object({})).action(async () => {
	const data = await isAuthorized();
	if (!data) throw new Error("Unauthorized");

	updateTag(`get-user-guilds-${data.user.id}`);
	refresh();
});

export const revalidateAll = actionClient.inputSchema(z.object({})).action(async () => {
	if (!(await isAuthorized())) throw new Error("Unauthorized");

	refresh();
});

export const getGuild = guildActionClient
	.inputSchema(z.object({ guildId: z.string() }))
	.action(async ({ parsedInput: { guildId } }) => {
		// The webhook URLs hold tokens, so they never leave the server
		return prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
			omit: {
				webhook_url: true,
				news_webhook_url: true,
				notification_webhook_url: true,
			},
		});
	});

export const enableGuild = guildActionClient
	.inputSchema(z.object({ guildId: z.string() }))
	.action(async ({ parsedInput: { guildId } }) => {
		const botGuilds = await getBotGuilds([guildId]);
		if (!botGuilds.some((guild) => guild.id === guildId)) {
			throw new Error("The bot is not in this guild");
		}

		await prisma.enabled_guilds.upsert({
			where: {
				guild_id: BigInt(guildId),
			},
			create: {
				guild_id: BigInt(guildId),
			},
			update: {},
		});

		refresh();
	});
