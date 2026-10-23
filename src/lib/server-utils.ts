import "server-only";

import { checkBotPermissions, getGuildsWithBotAccess, getUserGuilds } from "@lib/discord-api";
import { compareGuilds } from "@lib/guild-order";
import { getSession } from "@lib/session";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import type { Route } from "next";
import { redirect } from "next/navigation";

export async function isAuthorizedForGuild(guildId: string): Promise<RESTAPIPartialCurrentUserGuild | false> {
	const session = await getSession();
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

// Sends a request without a valid ?g= to the first guild that has the bot. Otherwise it goes to the home page.
export async function redirectToDefaultGuild(path: string, current?: string): Promise<null> {
	const guilds = await getGuildsWithBotAccess();
	if (current && guilds.some((guild) => guild.id === current)) return null;

	const target = guilds.filter((guild) => guild.botAccess).sort(compareGuilds)[0];
	if (target) redirect(`${path}?g=${target.id}` as Route);
	// No guild has the bot: show the home page, which has the invite state.
	if (path !== "/") redirect("/");
	return null;
}

// Turns boolean settings into the 0/1 columns of the database. Skips missing keys.
export function toFlags<T extends string>(settings: Partial<Record<T, boolean>>): Partial<Record<T, number>> {
	const flags: Partial<Record<T, number>> = {};
	for (const key of Object.keys(settings) as T[]) {
		const value = settings[key];
		if (value !== undefined) flags[key] = Number(value);
	}
	return flags;
}

export async function isAuthorized() {
	const session = await getSession();
	if (!session?.session || !session?.user) return false;
	return { session: session.session, user: session.user };
}
