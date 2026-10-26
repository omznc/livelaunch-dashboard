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
	account: {
		// The OAuth state in 1.7 is longer than Verification.value (VARCHAR 255).
		storeStateStrategy: "cookie",
	},
	session: {
		fields: {
			token: "token",
		},
	},
	advanced: {
		ipAddress: {
			// HAProxy appends to X-Forwarded-For. Skip private hops, so the last public IP is the client.
			trustedProxies: ["127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "::1/128", "fc00::/7"],
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
