'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';

import { cn } from '@lib/utils';
import { FaDiscord } from 'react-icons/fa';
import { Button } from '@components/ui/button';

// a simple sign in with discord button, some text, a title.
export default function AuthenticationPage() {
	return (
		<div
			className={cn('flex flex-col justify-center items-center h-screen')}
		>
			<h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
				LiveLaunch
			</h1>
			<Button
				className='mt-6'
				onClick={() =>
					signIn('discord', {
						callbackUrl: `${window.location.origin}/`,
					})
				}
			>
				<FaDiscord className='inline-block mr-2' />
				Sign in with Discord
			</Button>
		</div>
	);
}
