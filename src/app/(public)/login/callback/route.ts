import {discord, lucia} from "@lib/auth";
import {cookies} from "next/headers";
import {OAuth2RequestError} from "arctic";
import prisma from "@lib/prisma";

function toCamelCase(obj: Record<string, any>) {
	const newObj: Record<string, any> = {};
	for (const key in obj) {
		const newKey = key.replace(/([-_][a-z])/ig, ($1) => {
			return $1.toUpperCase()
				.replace("-", "")
				.replace("_", "");
		});
		newObj[newKey] = obj[key];
	}
	return newObj;
}

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies().get("discord_oauth_state")?.value ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		return new Response("whoops", {
			status: 400
		});
	}

	try {
		const tokens = await discord.validateAuthorizationCode(code);
		const response = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const discordUser = await response.json();

		const existingUser = await prisma.user.findUnique({
			where: {
				id: discordUser.id
			}
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			});
		}

		const {avatar_decoration_data, ...rest} = discordUser;

		const data = {
			id: discordUser.id,
			...toCamelCase(rest),
			...toCamelCase(tokens)
		}

		await prisma.user.create({
			data
		});


		const session = await lucia.createSession(discordUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} catch (e) {
		console.log(e)

		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}