import {Lucia, Session} from "lucia";
import {cache} from "react";
import {User as PrismaUser} from "@prisma/client";

import {PrismaAdapter} from "@lucia-auth/adapter-prisma";
import {Discord} from "arctic";

import client from '@lib/prisma';
import env from "@env";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const adapter = new PrismaAdapter(client.session, client.user);
export const discord = new Discord(env.NEXT_PUBLIC_DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, env.PUBLIC_URL + "/login/callback");

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: PrismaUser;
	}
}

export const validateRequest = cache(
	async (): Promise<{ session: Session | null; user: PrismaUser | null }> => {
		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null
			};
		}

		const result = await lucia.validateSession(sessionId);
		try {
			if (result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch {
		}

		if (!result.user) {
			return {
				user: null,
				session: null
			};
		}

		const user = await client.user.findUnique({
			where: {
				id: result.user?.id
			}
		});

		if (!user) {
			return {
				user: null,
				session: null
			};
		}

		if (user.accessTokenExpiresAt! < new Date()) {
			const tokens = await discord.refreshAccessToken(user.refreshToken!).catch(async () => {
				await client.user.delete({
					where: {
						id: user.id
					}
				});

				redirect("/login");
			});

			if (!tokens) {
				return {
					user: null,
					session: null
				};
			}
			await client.user.update({
				where: {
					id: user.id
				},
				data: {
					accessToken: tokens.accessToken,
					accessTokenExpiresAt: tokens.accessTokenExpiresAt,
					refreshToken: tokens.refreshToken
				}
			});
		}

		return {
			user,
			session: result.session
		};
	}
);
