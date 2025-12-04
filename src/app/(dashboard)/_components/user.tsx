import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { auth } from '@lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function User() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 md:h-8 md:w-8">
          <Avatar className="h-9 w-9 rounded-sm md:h-8 md:w-8">
            {user?.image ? (
              <Image width={50} height={50} src={user.image} alt={'Profile photo'} />
            ) : (
              <AvatarFallback>
                <p>{user?.name?.[0]}</p>
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout}>
            <button type="submit" className="w-full text-left">
              Log out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function logout() {
  'use server';

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return;
  }

  await auth.api.signOut({
    headers: await headers(),
  });

  redirect('/login');
}
