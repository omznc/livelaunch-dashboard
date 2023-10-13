import NextAuth, { AuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import env from '@env';
import prisma from '@lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { AxiomRequest, withAxiom } from 'next-axiom';
import { Account } from '@prisma/client';

export const authOptions: AuthOptions = {
	// @ts-ignore
	adapter: PrismaAdapter(prisma),
	providers: [
		DiscordProvider({
			clientId: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			authorization: { params: { scope: 'identify email guilds' } },
		}),
	],
	secret: env.NEXTAUTH_SECRET,
	session: {
		strategy: 'database',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user = user;
				const account = await prisma.account.findFirst({
					where: {
						userId: session.user.id,
					},
				});
				if (account?.expires_at && account?.expires_at < Date.now()) {
					session.account = await refreshDiscordToken(account);
				} else {
					session.account = account;
				}
			}
			if (!session.account || !session.user) {
				session.account = null;
				session.user = null;
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
};

const handler = NextAuth(authOptions);

export const GET = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);

export const POST = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);

const refreshDiscordToken = async (account: Account) => {
	const response = await fetch(`https://discord.com/api/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
			client_secret: env.DISCORD_CLIENT_SECRET,
			grant_type: 'refresh_token',
			refresh_token: account.refresh_token,
		}),
	});
	const data = await response.json();
	if (data.error) {
		await prisma.account.delete({
			where: {
				id: account.id,
			},
		});
		return null;
	}
	return await prisma.account.update({
		where: {
			id: account.id,
		},
		data: {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			expires_at: Date.now() / 1000 + data.expires_in,
		},
	});
};
