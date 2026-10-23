// Guilds with the bot first, then by name.
export function compareGuilds(a: { name: string; botAccess: boolean }, b: { name: string; botAccess: boolean }) {
	if (a.botAccess !== b.botAccess) return a.botAccess ? -1 : 1;
	return a.name.localeCompare(b.name);
}
