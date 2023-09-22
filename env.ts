import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
	// These are only visible to server-side code
	server: {
		DATABASE_URL: z
			.string({
				description: 'MySQL database URL',
				required_error: 'DATABASE_URL is required',
			})
			.url({
				message: 'DATABASE_URL must be a valid URL (mysql://)',
			}),
		DISCORD_CLIENT_SECRET: z
			.string({
				description: 'Discord client secret',
				required_error: 'DISCORD_CLIENT_SECRET is required',
			})
			.min(
				1,
				'DISCORD_CLIENT_SECRET must be a valid Discord client secret'
			),
		DISCORD_BOT_TOKEN: z
			.string({
				description: 'Discord bot token',
				required_error: 'DISCORD_BOT_TOKEN is required',
			})
			.min(1, 'DISCORD_BOT_TOKEN must be a valid Discord bot token'),
		NEXTAUTH_SECRET: z
			.string({
				description: 'NextAuth secret',
				required_error: 'NEXTAUTH_SECRET is required',
			})
			.min(
				24,
				'NEXTAUTH_SECRET must be a valid NextAuth secret (>24 characters)'
			),
		TOPGG_TOKEN: z
			.string({
				description: 'Top.gg token',
				required_error: 'TOPGG_TOKEN is required',
			})
			.min(1, 'TOPGG_TOKEN must be a valid Top.gg token'),
		NODE_ENV: z.string({
			description: 'Node environment',
		}),
	},
	// These are visible to both server-side and client-side code
	client: {
		NEXT_PUBLIC_DISCORD_CLIENT_ID: z
			.string({
				description: 'Discord client ID',
				required_error: 'DISCORD_CLIENT_ID is required',
			})
			.min(1, 'DISCORD_CLIENT_ID must be a valid Discord client ID'),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NEXT_PUBLIC_DISCORD_CLIENT_ID:
			process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
		DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		TOPGG_TOKEN: process.env.TOPGG_TOKEN,
		NODE_ENV: process.env.NODE_ENV,
	},
});

export default env;
