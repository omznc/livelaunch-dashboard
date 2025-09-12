import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
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

  console.log(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative md:h-8 md:w-8 h-9 w-9">
          <Avatar className="md:h-8 md:w-8 h-9 w-9 md:rounded-full rounded-sm">
            {user?.avatar ? (
              <Image width={50} height={50} src={user.avatar} alt={'Profile photo'} />
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
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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
