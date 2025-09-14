import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from 'process';
import { headers } from 'next/headers';

export async function middleware(request: NextRequest) {
  const resp = await fetch(`${env.PUBLIC_URL}/api/auth/get-session`, {
    headers: await headers(),
  });

  const session = await resp.json();

  if (!session) {
    return NextResponse.redirect(new URL(`/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|login(?:/|$)|[^/]+\\.[^/]+$).*)'],
};
