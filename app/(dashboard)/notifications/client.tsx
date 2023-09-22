'use client';

import { enabled_guilds } from '@prisma/client';
import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import {
	FaArrowUp,
	FaCalendar,
	FaCalendarCheck,
	FaCalendarMinus,
	FaCalendarTimes,
	FaEye,
	FaEyeSlash,
} from 'react-icons/fa';
import { Switch } from '@components/ui/switch';
import { useEffect, useState } from 'react';
import { updateSettings } from '@app/(dashboard)/general/actions';
import Link from 'next/link';
import RetainQueryLink from '@components/retain-query-link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@components/ui/input';
import toast from 'react-hot-toast';
import { useDebounce } from '@lib/hooks';

interface ClientProps {
	guild: enabled_guilds;
}

export interface GeneralSettings {
	days: number;
	hours: number;
	minutes: number;
}

export default function Client({ guild }: ClientProps) {
	const [settings, setSettings] = useState<GeneralSettings>({
		days: 0,
		hours: 0,
		minutes: 0,
	});

	const debouncedSettings = useDebounce(settings, 1000 * 1);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}

		toast.success(
			`Days: ${settings.days}, Hours: ${settings.hours}, Minutes: ${settings.minutes}`
		);
	}, [debouncedSettings]);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h4
					className='scroll-m-20 text-xl font-semibold tracking-tight'
					id='notifications'
				>
					Notifications
				</h4>
				<p className='text-sm inline-flex gap-1 items-center select-none opacity-50'>
					{
						'What kinds of notifications will the bot send? This can be used alongside'
					}
					<RetainQueryLink
						href={{
							pathname: '/general',
							hash: '#scheduled-events',
						}}
						className='inline-flex items-center gap-1 brightness-125 hover:underline'
					>
						Scheduled Events <FaArrowUp className='-rotate-45' />
					</RetainQueryLink>
				</p>
			</div>
			<div
				className={`flex border cursor-pointer hover:bg-muted/10 rounded-md items-center transition-all justify-between space-x-2 p-4`}
			>
				<div className='flex flex-col gap-2'>
					<Label htmlFor='notifications-countdown'>
						Notification Countdown
					</Label>
					<p className='text-sm select-none opacity-50'>
						{
							'Set how long before a launch the bot should send a notification.'
						}
					</p>
					<Separator />
					<p className='text-sm select-none inline-flex items-center gap-2 opacity-60'>
						{`That's ${
							settings.days * 24 + settings.hours
						} hours and ${settings.minutes} minutes beforehand.`}
					</p>
				</div>
				<div className='flex gap-2 items-center'>
					<div className='grid max-w-sm items-center gap-1.5'>
						<Label htmlFor='days'>Days (0-31)</Label>
						<Input
							type='number'
							id='days'
							placeholder='Days'
							min={0}
							max={31}
							onChange={e => {
								e.target.valueAsNumber = clamp(
									e.target.valueAsNumber,
									0,
									31
								);

								setSettings(prev => ({
									...prev,
									days: e.target.valueAsNumber,
								}));
							}}
						/>
					</div>
					<div className='grid max-w-sm items-center gap-1.5'>
						<Label htmlFor='hours'>Hours (0-24)</Label>
						<Input
							type='number'
							id='hours'
							placeholder='Hours'
							min={0}
							max={24}
							onChange={e => {
								e.target.valueAsNumber = clamp(
									e.target.valueAsNumber,
									0,
									24
								);

								setSettings(prev => ({
									...prev,
									hours: e.target.valueAsNumber,
								}));
							}}
						/>
					</div>
					<div className='grid max-w-sm items-center gap-1.5'>
						<Label htmlFor='minutes'>Minutes (0-60)</Label>
						<Input
							type='number'
							id='minutes'
							placeholder='Minutes'
							min={0}
							max={60}
							onChange={e => {
								e.target.valueAsNumber = clamp(
									e.target.valueAsNumber,
									0,
									60
								);
								setSettings(prev => ({
									...prev,
									minutes: e.target.valueAsNumber,
								}));
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
