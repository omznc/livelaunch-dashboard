'use client';

import { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotEnabled() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mounted) {
      window.dispatchEvent(new Event('showHelpDialog'));
    }
    setMounted(true);
  }, [mounted]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-center font-bold text-3xl">{"This guild isn't enabled"}</h2>
        <p className="mt-2 text-center">{"You can't use LiveLaunch until you enable it for this guild."}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => {
            router.push('/');
          }}
        >
          Home
        </Button>
        <Button
          onClick={() => {
            window.dispatchEvent(new Event('showHelpDialog'));
          }}
        >
          Enable
        </Button>
      </div>
    </div>
  );
}
