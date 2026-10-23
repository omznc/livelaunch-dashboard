import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { auth } from "@lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import DadJokeButton from "@/src/components/easter-eggs/dad-joke-easter-egg";
import { LaunchControlResetEasterEgg } from "@/src/components/easter-eggs/launch-control-easter-egg";
import { ScreensaverToggle } from "@/src/components/easter-eggs/screensaver-easter-egg";

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
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9 border-line2 p-0"
					aria-label="Account menu"
				>
					<Avatar className="h-full w-full">
						{user?.image ? (
							<Image width={50} height={50} src={user.image} alt={"Profile photo"} />
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
					<p className="truncate font-medium font-sans text-fg text-sm normal-case leading-5 tracking-normal">
						{user.name}
					</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<LaunchControlResetEasterEgg />
				<ScreensaverToggle />
				<DropdownMenuSeparator />
				<DadJokeButton />
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
	"use server";

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session) {
		return;
	}

	await auth.api.signOut({
		headers: await headers(),
	});

	redirect("/login");
}
