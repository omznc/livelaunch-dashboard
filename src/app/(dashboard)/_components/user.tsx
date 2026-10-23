import { ThemeMenu } from "@components/theme";
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
import { ChevronsUpDown } from "lucide-react";
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
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					aria-label="Account menu"
					className="h-full w-full min-w-0 justify-center border-0 px-0 font-sans text-[15px] hover:bg-raised data-[state=open]:bg-raised focus-visible:outline-offset-[-2px] min-[1100px]:justify-between min-[1100px]:px-4"
				>
					<ChevronsUpDown className="mr-auto hidden h-4 w-4 shrink-0 text-fg3 min-[1100px]:block" />
					<span className="hidden truncate min-[1100px]:block">{user.name}</span>
					<Avatar className="h-6 w-6 min-[1100px]:ml-2">
						{user.image ? (
							<Image width={48} height={48} src={user.image} alt={""} />
						) : (
							<AvatarFallback>{user.name?.[0]}</AvatarFallback>
						)}
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60" align="end" sideOffset={0} forceMount>
				<DropdownMenuLabel className="font-normal">
					<p className="truncate font-medium font-sans text-fg text-sm normal-case leading-5 tracking-normal">
						{user.name}
					</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ThemeMenu />
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
