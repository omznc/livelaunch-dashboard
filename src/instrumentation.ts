import * as Sentry from "@sentry/nextjs";

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init({
			dsn: 'https://f71bc9d2a37d17a57d2936c077353602@o4507024650403840.ingest.us.sentry.io/4507024770596864',
			tracesSampleRate: 1,
			debug: false,
		});

	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		Sentry.init({
			dsn: 'https://f71bc9d2a37d17a57d2936c077353602@o4507024650403840.ingest.us.sentry.io/4507024770596864',
			tracesSampleRate: 1,
			debug: false,
		});
	}
}
