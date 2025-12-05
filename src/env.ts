import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
	server: {
		DATABASE_URL: z.url({
			message: "DATABASE_URL must be a valid URL (mysql://)",
		}),
		DISCORD_CLIENT_SECRET: z.string(),
		DISCORD_BOT_TOKEN: z.string(),
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
	},
	client: {
		NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
	},
});

export default env;
