import env from "@env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "mysql",
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	socialProviders: {
		discord: {
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			// Skip the default "email" scope. better-auth needs an email, so store one unique per Discord ID.
			disableDefaultScope: true,
			scope: ["identify", "guilds"],
			mapProfileToUser: (profile) => ({
				email: `${profile.id}@discord.invalid`,
				emailVerified: false,
			}),
		},
	},
	session: {
		fields: {
			token: "token",
		},
	},
	databaseHooks: {
		session: {
			create: {
				// Not disableIpTracking: it also turns off the rate limiter.
				before: async (session) => ({
					data: { ...session, ipAddress: null, userAgent: null },
				}),
			},
		},
	},
	logger: {
		level: process.env.NODE_ENV === "production" ? "warn" : "debug",
		log: (level, message, ...args) => {
			console.log(`[better-auth] ${level.toUpperCase()}: ${message}`, ...args);
		},
	},
});
