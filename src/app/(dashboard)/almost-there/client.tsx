'use client';

import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { AlertCircle, RefreshCw, CheckCircle, XCircle, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Setting, SettingGroup } from '@components/ui/setting';
import Link from 'next/link';
import type { PermissionStatus } from '@lib/discord-api';

interface AlmostThereClientProps {
  guildId: string;
  guildName: string;
  permissions: PermissionStatus[];
}

export default function AlmostThereClient({ guildId, guildName, permissions }: AlmostThereClientProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const router = useRouter();

  const handleRefresh = async () => {
    if (countdown > 0) {
      toast.error(`You can refresh again in ${countdown} second${countdown !== 1 ? 's' : ''}`);
      return;
    }

    setIsRefreshing(true);
    const now = Date.now();
    setLastRefresh(now);

    try {
      router.refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // Initialize countdown on component mount
  useEffect(() => {
    if (lastRefresh) {
      const now = Date.now();
      const timePassed = now - lastRefresh;
      const remaining = Math.max(0, 30000 - timePassed);
      setCountdown(Math.ceil(remaining / 1000));
    }
  }, []); // Only run once on mount

  // Update countdown timer every second
  useEffect(() => {
    if (!lastRefresh) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - lastRefresh;
      const remaining = Math.max(0, 30000 - timePassed);

      setCountdown(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const canRefresh = countdown === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-8 justify-center w-full">
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold">Almost There!</h2>
          <p className="mt-2 opacity-50">
            LiveLaunch needs additional permissions in <strong>{guildName}</strong> to work properly. You can also just
            re-invite the bot to your server.
          </p>
        </div>
      </div>

      <SettingGroup
        title="Missing Permissions"
        description={
          <>
            The following Discord permissions are required for LiveLaunch to function properly.{' '}
            <Link
              href="https://support.discord.com/hc/en-us/articles/206029707-Setting-Up-Permissions-FAQ"
              target="_blank"
              className="inline-flex items-center gap-1 brightness-125 hover:underline"
            >
              Learn more <ArrowUp className="rotate-45" />
            </Link>
          </>
        }
      >
        {permissions.map((permission, index) => (
          <Setting
            key={index}
            label={permission.name}
            description={permission.description}
            active={permission.hasPermission}
          >
            {permission.hasPermission ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </Setting>
        ))}
      </SettingGroup>

      {permissions.some(p => !p.hasPermission) && (
        <div className="flex flex-col gap-4 w-full">
          <div>
            <h3 className="text-xl font-bold mb-1">How to Fix</h3>
            <p className="text-sm opacity-70 mb-4">
              Follow these steps to grant the required permissions to the LiveLaunch bot:
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Discord server settings</li>
                <li>Navigate to "Roles" in the left sidebar</li>
                <li>Find the "LiveLaunch" role</li>
                <li>Enable all the permissions listed above</li>
                <li>Click "Save Changes"</li>
                <li>Come back and click "Check Again" below</li>
              </ol>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleRefresh} disabled={isRefreshing || !canRefresh} className="min-w-[140px]">
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Again
                  </>
                )}
              </Button>
            </div>
            {lastRefresh && !canRefresh && (
              <p className="text-center text-sm opacity-50 mt-2">
                You can check again in {countdown} second{countdown !== 1 ? 's' : ''}
              </p>
            )}
            <p className="text-center text-sm opacity-50 mt-2 w-full md:w-1/2 mx-auto">
              Discord might take a few minutes to update the permissions, so if you don't see the changes right away,
              check back in a few minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
