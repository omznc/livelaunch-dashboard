'use client';

import { Button } from '@components/ui/button';
import { signIn } from '@lib/auth-client';
import { siDiscord } from 'simple-icons';

export default function AuthenticationPage() {
  const handleDiscordSignIn = async () => {
    await signIn.social({
      provider: 'discord',
    });
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-8">
      <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
        <h1 className="inline-flex items-center gap-2 text-center font-bold text-6xl">LiveLaunch Dashboard</h1>
        <p className="w-full text-center font-medium text-xl">
          {'Creates space related events and sends news, notifications and live streams!'}
        </p>
      </div>
      <Button className="mt-6" onClick={handleDiscordSignIn}>
        <svg className="mr-2 inline-block h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <title>Discord</title>
          <path d={siDiscord.path} />
        </svg>
        Sign in with Discord
      </Button>
    </div>
  );
}
