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
    <div className="flex flex-col gap-8 w-full h-[100dvh] justify-center items-center">
      <div className="flex flex-col gap-2 p-2 w-full justify-center items-center">
        <h1 className="text-6xl inline-flex items-center text-center gap-2 font-bold">LiveLaunch Dashboard</h1>
        <p className="text-xl text-center w-full font-medium">
          {'Creates space related events and sends news, notifications and live streams!'}
        </p>
      </div>
      <Button className="mt-6" onClick={handleDiscordSignIn}>
        <svg className="inline-block mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d={siDiscord.path} />
        </svg>
        Sign in with Discord
      </Button>
    </div>
  );
}
