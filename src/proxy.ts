import env from "@env";
import { logger } from "@lib/logger";
import type { Session } from "better-auth";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const resp = await fetch(`${env.BETTER_AUTH_URL}/api/auth/get-session`, {
		headers: await headers(),
	});

	let session: Session | null = null;

	if (resp.ok) {
		try {
			session = await resp.json();
		} catch {
			logger.error("proxy", "Could not parse session JSON", { url: request.url });
		}
	}

	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api/|_next/|login(?:/|$)|[^/]+\\.[^/]+$).*)"],
};
