import {Button} from '@components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {lucia, validateRequest} from "@lib/auth";
import prisma from "@lib/prisma";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import Image from 'next/image'

export default async function User() {
	const {session} = await validateRequest();
	const user = await prisma.user.findUnique({
		where: {
			id: session?.userId,
		},
	});

	if (!session || !user) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='relative md:h-8 md:w-8 h-9 w-9'
				>
					<Avatar className='md:h-8 md:w-8 h-9 w-9 md:rounded-full rounded-sm'>
						{
							user?.avatar ?

								<Image
									width={50}
									height={50}
									src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
									alt={'Profile photo'}
								/>
								:
								<AvatarFallback>
							<p>{user?.username?.[0]}</p>
						</AvatarFallback>
						}
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>
							{user.username}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{user.email}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{user.id}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator/>
				<DropdownMenuItem asChild
				>
					<form action={logout}>
						<button type='submit' className='w-full text-left'>
							Log out
						</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

async function logout() {
	"use server";

	const {session} = await validateRequest();
	console.log(session);
	if (!session) {
		return {
			error: "Unauthorized"
		};
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	console.log("Logged out")

	return redirect("/login");
}
