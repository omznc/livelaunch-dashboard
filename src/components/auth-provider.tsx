'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
	children: ReactNode;
	session: any;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
	return <SessionProvider session={session}>{children}</SessionProvider>;
}
