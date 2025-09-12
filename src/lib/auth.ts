import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import env from '@env';
import prisma from './prisma';
import { createAuthMiddleware } from 'better-auth/api';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.PUBLIC_URL,
  socialProviders: {
    discord: {
      clientId: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
  session: {
    fields: {
      token: 'token',
    },
  },
});
