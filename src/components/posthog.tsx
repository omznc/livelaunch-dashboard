'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { useSession } from '../lib/auth-client';

export default function PosthogIdentify() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }
    const user = session?.user;

    const alreadyIdentifiedId = posthog.get_distinct_id();

    if (user && alreadyIdentifiedId !== user.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });
      posthog.alias(user.id, alreadyIdentifiedId);
    }

    if (alreadyIdentifiedId) {
      return;
    }

    posthog.identify();
  }, [session, isPending]);

  return null;
}
