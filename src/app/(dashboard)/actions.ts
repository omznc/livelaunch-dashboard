"use server";

import { auth } from "@lib/auth";
import { prisma } from "@lib/prisma";
import { actionClient, guildActionClient } from "@lib/safe-actions";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

export const revalidateGuilds = actionClient.inputSchema(z.object({})).action(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.session || !session?.user) return;

	revalidateTag("get-bot-guilds", "max");
	revalidateTag(`get-user-guilds-${session.user.id}`, "max");
});

export const revalidateAll = actionClient.inputSchema(z.object({})).action(async () => {
	revalidatePath("/agencies", "page");
	revalidatePath("/news-sites");
});

export const getGuild = guildActionClient
	.inputSchema(z.object({ guildId: z.string() }))
	.action(async ({ parsedInput: { guildId } }) => {
		return prisma.enabled_guilds.findFirst({
			where: {
				guild_id: BigInt(guildId),
			},
		});
	});

export const enableGuild = guildActionClient
	.inputSchema(z.object({ guildId: z.string() }))
	.action(async ({ parsedInput: { guildId } }) => {
		await prisma.enabled_guilds.upsert({
			where: {
				guild_id: BigInt(guildId),
			},
			create: {
				guild_id: BigInt(guildId),
			},
			update: {},
		});
	});
