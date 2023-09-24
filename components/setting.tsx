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
import { useHash } from '@lib/hooks';
import { FaCopy } from 'react-icons/fa6';

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
				`flex border rounded-md items-center transition-all justify-between space-x-2 p-4`,
				{
					'bg-muted/30': active,
				}
			)}
		>
			<div className='flex h-full transition-all w-full gap-4'>
				{image && (
					<Image
						src={image}
						alt={label}
						width={42}
						height={42}
						className='rounded-full h-full max-h-[42px] w-auto bg-white'
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
							<FaCopy className='opacity-0 h-4 w-4 group-hover:opacity-50 transition-all' />
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
