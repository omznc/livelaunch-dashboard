import NextAuth, { AuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import env from '@env';
import prisma from '@lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { withAxiom, AxiomRequest } from 'next-axiom';

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
				if (account) {
					session.account = account;
				}
			}

			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
};

const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

export const GET = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);

export const POST = withAxiom(
	async (req: AxiomRequest, res) => await handler(req, res)
);
