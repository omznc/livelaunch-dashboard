import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { isAuthorizedForGuild } from './server-utils';
import { z } from 'zod';
import { logger } from './logger';

export const guildIdSchema = z.object({
  guildId: z.string(),
});

export const actionClient = createSafeActionClient({
  handleServerError(e: Error) {
    logger.error('safe-actions', 'Server action error occurred', {
      error: e.message,
      stack: e.stack,
    });

    if (e.message === 'Unauthorized') {
      return 'You are not authorized to perform this action';
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const guildActionClient = actionClient.use(async ({ next, clientInput }) => {
  const guildId = (clientInput as { guildId?: string })?.guildId;

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
