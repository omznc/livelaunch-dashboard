'use client';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { Inter } from 'next/font/google';
import Error from 'next/error';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('w-screen h-screen flex flex-col gap-4 justify-center items-center', inter.className)}>
        <h1 className="text-4xl font-bold">Something went wrong!</h1>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
