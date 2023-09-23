'use client';

import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from 'next-auth/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';

export default function User() {
	const session = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='relative md:h-8 md:w-8 h-9 w-9'
				>
					<Avatar className='md:h-8 md:w-8 h-9 w-9 md:rounded-full rounded-sm'>
						<AvatarImage
							src={session.data!.user?.image ?? undefined}
						/>
						<AvatarFallback>
							<p>{session.data!.user?.name?.[0]}</p>
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>
							{session.data!.user?.name}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{session.data!.user?.email}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{session.data!.account?.providerAccountId}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						await signOut({ callbackUrl: '/login' });
					}}
				>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
