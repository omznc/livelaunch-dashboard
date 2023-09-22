'use client';

import { enabled_guilds } from '@prisma/client';
import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import {
	FaArrowUp,
	FaCalendarCheck,
	FaCalendarTimes,
	FaEye,
	FaEyeSlash,
} from 'react-icons/fa';
import { Switch } from '@components/ui/switch';
import { ReactNode, useEffect, useState } from 'react';
import { updateSettings } from '@app/(dashboard)/general/actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ClientProps {
	guild: enabled_guilds;
}

export interface GeneralSettings {
	notification_button_fc: boolean;
	notification_button_g4l: boolean;
	notification_button_sln: boolean;
	se_launch: boolean;
	se_event: boolean;
}

export default function Client({ guild }: ClientProps) {
	const [settings, setSettings] = useState<GeneralSettings>({
		notification_button_fc: Boolean(guild.notification_button_fc),
		notification_button_g4l: Boolean(guild.notification_button_g4l),
		notification_button_sln: Boolean(guild.notification_button_sln),
		se_launch: Boolean(guild.se_launch),
		se_event: Boolean(guild.se_event),
	});
	const [hash, setHash] = useState('');

	useEffect(() => {
		setHash(window.location.hash);
		setTimeout(() => {
			setHash('');
		}, 1000 * 5);
	}, []);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h4
					className={cn(
						'scroll-m-20 text-xl font-semibold tracking-tight',
						{
							'animate-pulse': hash === '#buttons',
						}
					)}
					id='buttons'
				>
					Buttons
				</h4>
				<p className='text-sm inline-flex gap-1 items-center select-none opacity-50'>
					{
						'Whether or not to show the notification buttons in embeds.'
					}
					<Link
						href={'https://i.imgur.com/ZFi4hEt.png'}
						target={'_blank'}
						className='inline-flex items-center gap-1 brightness-125 hover:underline'
					>
						Example <FaArrowUp className='rotate-45' />
					</Link>
				</p>
			</div>
			<ToggleSetting
				label={'Flight Club'}
				description={'Show the Flight Club button in embeds.'}
				switchId={'toggle-fc'}
				checked={settings.notification_button_fc}
				guildId={String(guild.guild_id)}
				setter={checked => {
					updateSettings(String(guild.guild_id), {
						...settings,
						notification_button_fc: checked,
					});
					setSettings(prev => ({
						...prev,
						notification_button_fc: checked,
					}));
				}}
				status={
					<>
						The Flight Club button will be{' '}
						{settings.notification_button_fc ? (
							<>
								shown <FaEye className='-mb-0.5' />
							</>
						) : (
							<>
								hidden <FaEyeSlash className='-mb-0.5' />
							</>
						)}
					</>
				}
			/>

			<ToggleSetting
				label={'Go4Liftoff'}
				description={'Show the Go4Liftoff button in embeds.'}
				switchId={'toggle-g4l'}
				checked={settings.notification_button_g4l}
				guildId={String(guild.guild_id)}
				setter={checked => {
					updateSettings(String(guild.guild_id), {
						...settings,
						notification_button_g4l: checked,
					});
					setSettings(prev => ({
						...prev,
						notification_button_g4l: checked,
					}));
				}}
				status={
					<>
						The Go4Liftoff button will be{' '}
						{settings.notification_button_g4l ? (
							<>
								shown <FaEye className='-mb-0.5' />
							</>
						) : (
							<>
								hidden <FaEyeSlash className='-mb-0.5' />
							</>
						)}
					</>
				}
			/>

			<ToggleSetting
				label={'Space Launch Now'}
				description={'Show the Space Launch Now button in embeds.'}
				switchId={'toggle-sln'}
				checked={settings.notification_button_sln}
				guildId={String(guild.guild_id)}
				setter={checked => {
					updateSettings(String(guild.guild_id), {
						...settings,
						notification_button_sln: checked,
					});
					setSettings(prev => ({
						...prev,
						notification_button_sln: checked,
					}));
				}}
				status={
					<>
						The Space Launch Now button will be{' '}
						{settings.notification_button_sln ? (
							<>
								shown <FaEye className='-mb-0.5' />
							</>
						) : (
							<>
								hidden <FaEyeSlash className='-mb-0.5' />
							</>
						)}
					</>
				}
			/>
			<div className='flex flex-col gap-2'>
				<h4
					className={cn(
						'scroll-m-20 text-xl font-semibold tracking-tight',
						{
							'animate-pulse': hash === '#scheduled-events',
						}
					)}
					id='scheduled-events'
				>
					Scheduled Events
				</h4>
				<p className='text-sm inline-flex items-center gap-1 select-none opacity-50'>
					{'What kinds of events will the bot create?'}
					<Link
						href={
							'https://support.discord.com/hc/en-us/articles/4409494125719-Scheduled-Events'
						}
						target={'_blank'}
						className='inline-flex items-center gap-1 brightness-125 hover:underline'
					>
						Learn more <FaArrowUp className='rotate-45' />
					</Link>
				</p>
			</div>

			<ToggleSetting
				label={'Launches'}
				description={
					'Will the bot schedule an event for space launches?'
				}
				switchId={'toggle-se-launch'}
				checked={settings.se_launch}
				guildId={String(guild.guild_id)}
				setter={checked => {
					updateSettings(String(guild.guild_id), {
						...settings,
						se_launch: checked,
					});
					setSettings(prev => ({
						...prev,
						se_launch: checked,
					}));
				}}
				status={
					<>
						Space launch events{' '}
						{settings.se_launch ? (
							<>
								will be created{' '}
								<FaCalendarCheck className='-mb-0.5' />
							</>
						) : (
							<>
								will not be created{' '}
								<FaCalendarTimes className='-mb-0.5' />
							</>
						)}
					</>
				}
			/>
			<ToggleSetting
				label={'Events'}
				description={'Will the bot schedule an event for space events?'}
				switchId={'toggle-se-event'}
				checked={settings.se_event}
				guildId={String(guild.guild_id)}
				setter={checked => {
					updateSettings(String(guild.guild_id), {
						...settings,
						se_event: checked,
					});
					setSettings(prev => ({
						...prev,
						se_event: checked,
					}));
				}}
				status={
					<>
						Space events{' '}
						{settings.se_event ? (
							<>
								will be created{' '}
								<FaCalendarCheck className='-mb-0.5' />
							</>
						) : (
							<>
								will not be created{' '}
								<FaCalendarTimes className='-mb-0.5' />
							</>
						)}
					</>
				}
			/>
		</div>
	);
}

export interface ToggleSettingProps {
	label: string;
	description: string;
	switchId: string;
	checked: boolean;
	guildId: string;
	setter: (checked: boolean) => void;
	status: ReactNode;
}

export function ToggleSetting({
	label,
	description,
	switchId,
	checked,
	setter,
	status,
}: ToggleSettingProps) {
	return (
		<div
			className={`flex border cursor-pointer hover:bg-muted/10 rounded-md items-center transition-all justify-between space-x-2 p-4 ${
				checked ? 'bg-muted/30' : ''
			}`}
			onClick={() => {
				document.getElementById(switchId)?.click();
			}}
		>
			<div className='flex flex-col gap-2'>
				<Label htmlFor={switchId}>{label}</Label>
				<p className='text-sm select-none opacity-50'>{description}</p>
				<Separator />
				<p className='text-sm select-none inline-flex items-center gap-2 opacity-60'>
					{status}
				</p>
			</div>
			<Switch
				id={switchId}
				onCheckedChange={setter}
				defaultChecked={checked}
			/>
		</div>
	);
}
