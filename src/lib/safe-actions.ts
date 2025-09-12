import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { isAuthorizedForGuild } from './server-utils';
import { z } from 'zod';

export const guildIdSchema = z.object({
  guildId: z.string(),
});

export const actionClient = createSafeActionClient({
  handleServerError(e: Error) {
    console.error('Action error:', e.message);

    if (e.message === 'Unauthorized') {
      return 'You are not authorized to perform this action';
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const guildActionClient = actionClient.use(async ({ next, clientInput }) => {
  const guildId = (clientInput as any)?.guildId;

  if (!guildId || typeof guildId !== 'string') {
    throw new Error('Guild ID is required');
  }

  const authorized = await isAuthorizedForGuild(guildId);
  if (!authorized) {
    throw new Error('Unauthorized');
  }

  return next({
    ctx: {
      guildId,
    },
  });
});
