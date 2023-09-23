import { ReactNode } from 'react';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { FaArrowRight, FaHashtag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@components/ui/tooltip';
import Link from 'next/link';
import { buttonVariants } from '@components/ui/button';
import { useHash } from '@lib/hooks';

interface SettingProps {
	label: string;
	description: string;
	active: boolean;
	children: ReactNode;
	image?: string;
}

export function Setting({
	label,
	description,
	active,
	children,
	image,
}: SettingProps) {
	return (
		<div
			className={cn(
				`flex border cursor-pointer hover:bg-muted/10 rounded-md items-center transition-all justify-between space-x-2 p-4`,
				{
					'bg-muted/30': active,
				}
			)}
			onClick={e => {
				(e.currentTarget.children[1] as HTMLDivElement).click();
			}}
		>
			<div className='flex h-full w-full gap-4'>
				{image && (
					<Image
						src={image}
						alt={label}
						width={32}
						height={32}
						className='rounded-full h-full w-auto'
					/>
				)}
				<div className='flex flex-col gap-2'>
					<Label>{label}</Label>
					<p className='text-sm select-none opacity-50'>
						{description}
					</p>
				</div>
			</div>
			{children}
		</div>
	);
}

interface SettingGroupProps {
	title: string;
	children: ReactNode;
}
export function SettingGroup({ title, children }: SettingGroupProps) {
	const id = title.toLowerCase().replaceAll(' ', '-');
	const hash = useHash();

	return (
		<div className='flex flex-col gap-2'>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild className={'w-fit'}>
						<h4
							className={cn(
								'group scroll-m-20 w-fit inline-flex cursor-pointer items-center gap-1 text-xl font-semibold tracking-tight',
								{
									'font-bold': id === hash.slice(1),
								}
							)}
							id={id}
							onClick={() => {
								const url = window.location.href.split('#')[0];
								navigator.clipboard
									.writeText(`${url}#${id}`)
									.then(() => {
										toast.success('Copied link');
									})
									.catch(() => {
										toast.error(
											'Failed to copy to clipboard!'
										);
									});
							}}
						>
							<FaHashtag
								className={cn(
									'opacity-50 transition-all group-hover:opacity-100',
									{
										'opacity-100': id === hash.slice(1),
									}
								)}
							/>
							{title}
						</h4>
					</TooltipTrigger>
					<TooltipContent>Copy link to this section</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<p className='text-sm inline-flex items-center gap-1 select-none opacity-50'>
				{children}
			</p>
		</div>
	);
}
