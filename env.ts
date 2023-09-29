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
		DISCORD_CLIENT_SECRET: z.string({
			description: 'Discord client secret',
			required_error: 'DISCORD_CLIENT_SECRET is required',
		}),
		DISCORD_BOT_TOKEN: z.string({
			description: 'Discord bot token',
			required_error: 'DISCORD_BOT_TOKEN is required',
		}),
		NEXTAUTH_SECRET: z.string({
			description: 'NextAuth secret',
			required_error: 'NEXTAUTH_SECRET is required',
		}),
		NEXTAUTH_URL: z
			.string({
				description: 'NextAuth URL',
				required_error: 'NEXTAUTH_URL is required',
			})
			.default('http://localhost:3000'),
	},
	// These are visible to both server-side and client-side code
	client: {
		NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string({
			description: 'Discord client ID',
			required_error: 'DISCORD_CLIENT_ID is required',
		}),
		NEXT_PUBLIC_AXIOM_DATASET: z.string({
			description: 'Axiom dataset',
		}),
		NEXT_PUBLIC_AXIOM_TOKEN: z.string({
			description: 'Axiom token',
		}),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NEXT_PUBLIC_DISCORD_CLIENT_ID:
			process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
		DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
		NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
	},
});

export default env;
