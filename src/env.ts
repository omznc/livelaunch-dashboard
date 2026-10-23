import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
	server: {
		DATABASE_URL: z.url({
			message: "DATABASE_URL must be a valid URL (mysql://)",
		}),
		// trim(): a CRLF .env can leave a "\r" at the end of a value
		DISCORD_CLIENT_ID: z.string().trim().min(1),
		DISCORD_CLIENT_SECRET: z.string().trim(),
		DISCORD_BOT_TOKEN: z.string().trim(),
		BETTER_AUTH_SECRET: z.string().trim(),
		BETTER_AUTH_URL: z.url(),
	},
	client: {},
	// Docker build has no secrets, so it skips validation
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	// Server vars are read from process.env at runtime
	experimental__runtimeEnv: {},
});

export default env;
