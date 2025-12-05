import "server-only";

import { auth } from "@lib/auth";
import { checkBotPermissions, getUserGuilds } from "@lib/discord-api";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function isAuthorizedForGuild(guildId: string): Promise<RESTAPIPartialCurrentUserGuild | false> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) return false;

	const guilds = await getUserGuilds();
	return guilds.find((g) => g.id === guildId) ?? false;
}

export async function checkGuildPermissions(guildId: string): Promise<RESTAPIPartialCurrentUserGuild | null> {
	const authorized = await isAuthorizedForGuild(guildId);
	if (!authorized) return null;

	const permissionCheck = await checkBotPermissions(guildId);
	if (!permissionCheck.hasAll) {
		redirect(`/almost-there?g=${guildId}`);
	}

	return authorized;
}

export async function isAuthorized() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.session || !session?.user) return false;
	return { session: session.session, user: session.user };
}
