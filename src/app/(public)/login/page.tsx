import {Button} from "@components/ui/button";
import {FaDiscord} from "react-icons/fa";
import Link from "next/link";

// a simple sign in with discord button, some text, a title.
export default async function AuthenticationPage() {
	return (
		<div className='flex flex-col gap-8 w-full h-[100dvh] justify-center items-center'>
			<div className='flex flex-col gap-2 p-2 w-full justify-center items-center'>
				<h1 className='text-6xl inline-flex items-center text-center gap-2 font-bold'>
					LiveLaunch Dashboard
				</h1>
				<p className='text-xl text-center w-full font-medium'>
					{
						'Creates space related events and sends news, notifications and live streams!'
					}
				</p>
			</div>
			<Link href={'/login/discord'} passHref>
				<Button
					className='mt-6'
				>
					<FaDiscord className='inline-block mr-2'/>
					Sign in with Discord
				</Button>
			</Link>
		</div>
	);
}
