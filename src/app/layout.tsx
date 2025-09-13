import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Toast from '@components/toast';
import type { ReactNode } from 'react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LiveLaunch Dashboard',
  description: 'The dashboard for LiveLaunch, a Discord bot.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <Script defer data-domain="livelaunch.juststephen.com" src="https://analytics.omarzunic.com/js/script.js" />
      <body className={inter.className}>
        <Toast />
        {children}
      </body>
    </html>
  );
}
