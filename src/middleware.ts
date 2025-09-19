import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { Session } from 'better-auth';
import env from '@env';

export async function middleware(request: NextRequest) {
  const resp = await fetch(`${env.PUBLIC_URL}/api/auth/get-session`, {
    headers: await headers(),
  });

  let session: Session | null = null;

  if (resp.ok) {
    try {
      session = await resp.json();
    } catch {
      console.error('Could not parse session');
    }
  }

  if (!session) {
    return NextResponse.redirect(new URL(`/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|login(?:/|$)|[^/]+\\.[^/]+$).*)'],
};
