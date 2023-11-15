import { ReactNode } from 'react';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { FaHashtag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { useHash } from '@lib/hooks';
import { FaCopy } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

interface SettingProps {
	label: string;
	description: string;
	active: boolean;
	children: ReactNode;
	image?: string;
	className?: string;
	disabled?: boolean;
	disabledMessage?: string;
}

export function Setting({
	label,
	description,
	active,
	children,
	image,
	className,
	disabled,
	disabledMessage,
}: SettingProps) {
	return (
		<div
			className={cn(
				`relative w-full flex justify-center items-center border rounded-md justify-center transition-all p-4`,
				{
					'bg-muted/30': active,
					'space-x-2 overflow-auto': !disabled,
					'cursor-not-allowed overflow-hidden': disabled,
				},
				className
			)}
		>
			{disabled && (
				<p className='text-sm absolute font-semibold text-center select-none'>
					{disabledMessage ?? 'This setting is disabled'}
				</p>
			)}
			<div
				className={cn(
					'flex w-full md:flex-row flex-col md:gap-0 gap-4 rounded-md items-center transition-all justify-between',
					{
						'blur-sm pointer-events-none select-none': disabled,
					}
				)}
			>
				<div className={cn('flex h-full transition-all w-full gap-4')}>
					{image && (
						<Image
							src={image}
							alt={label}
							width={42}
							height={42}
							className='rounded-full h-full max-h-[42px] w-auto bg-black'
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
		</div>
	);
}

interface SettingGroupProps {
	title: string;
	children?: ReactNode;
}

export function SettingGroup({ title, children }: SettingGroupProps) {
	const id = title.toLowerCase().replaceAll(' ', '-');
	const hash = useHash();
	const router = useRouter();

	console.log(hash);
	return (
		<div className='flex flex-col gap-2' key={hash}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild className={'w-fit'}>
						<h4
							className={cn(
								'group scroll-m-20 w-fit inline-flex cursor-pointer items-center gap-1 text-xl tracking-tight',
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
								window.location.hash = id;
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
			{children && (
				<p className='text-sm inline-flex items-center gap-1 select-none opacity-50'>
					{children}
				</p>
			)}
		</div>
	);
}
