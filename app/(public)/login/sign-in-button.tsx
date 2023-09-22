'use client';

import { Button } from '@components/ui/button';
import { signIn } from 'next-auth/react';
import { FaDiscord } from 'react-icons/fa';

export default function SignInButton() {
	return (
		<Button
			className='mt-6'
			onMouseDown={() =>
				signIn('discord', {
					callbackUrl: `${window.location.origin}/`,
				})
			}
		>
			<FaDiscord className='inline-block mr-2' />
			Sign in with Discord
		</Button>
	);
}