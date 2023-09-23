'use client';

import { enabled_guilds } from '@prisma/client';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import {
	FaArrowUp,
	FaCalendarCheck,
	FaCalendarTimes,
	FaCheckCircle,
	FaTimesCircle,
} from 'react-icons/fa';
import React, { useState } from 'react';
import { updateSettings } from './actions';
import RetainQueryLink from '@components/retain-query-link';
import { Input } from '@components/ui/input';
import { ToggleSetting } from '@app/(dashboard)/general/client';
import { Switch } from '@components/ui/switch';
import { Setting, SettingGroup } from '@components/setting';
import { useHash } from '@lib/hooks';

interface ClientProps {
	guild: enabled_guilds;
}

export interface NotificationsSettings {
	//	Set how long before a launch the bot should send a notification.

	countdown: {
		days: number;
		hours: number;
		minutes: number;
	};
	notification_end_status: boolean; // Enable or disable final status notifications
	notification_hold: boolean; // Enable or disable hold notifications
	notification_liftoff: boolean; // Enable or disable liftoff notifications
	notification_go: boolean; // Enable or disable go for launch notifications
	notification_tbc: boolean; // Enable or disable to be confirmed notifications
	notification_tbd: boolean; // Enable or disable to be determined notifications
}

export default function Client({ guild }: ClientProps) {
	const [settings, setSettings] = useState<NotificationsSettings>({
		countdown: {
			days: 0,
			hours: 0,
			minutes: 0,
		},
		notification_end_status: Boolean(guild.notification_end_status),
		notification_hold: Boolean(guild.notification_hold),
		notification_liftoff: Boolean(guild.notification_liftoff),
		notification_go: Boolean(guild.notification_go),
		notification_tbc: Boolean(guild.notification_tbc),
		notification_tbd: Boolean(guild.notification_tbd),
	});

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Notifications'}>
				{'Tweak how notifications work'}
				<RetainQueryLink
					href={{
						pathname: '/general',
						hash: '#scheduled-events',
					}}
					className='inline-flex items-center gap-1 brightness-125 hover:underline'
				>
					Scheduled Events <FaArrowUp className='-rotate-45' />
				</RetainQueryLink>
			</SettingGroup>
			<Setting
				label={'Notification Countdown'}
				description={
					'Set how long before a launch the bot should send a notification.'
				}
				active={false}
			>
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
									countdown: {
										...prev.countdown,
										days: e.target.valueAsNumber,
									},
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
									countdown: {
										...prev.countdown,
										hours: e.target.valueAsNumber,
									},
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
									countdown: {
										...prev.countdown,
										minutes: e.target.valueAsNumber,
									},
								}));
							}}
						/>
					</div>
				</div>
			</Setting>

			<SettingGroup title={'Filtering'}>
				{
					'Choose which launch statuses the bot should send notifications for.'
				}
			</SettingGroup>

			<Setting
				label={'End Status'}
				description={
					'Will the bot send a notification when the launch ends?'
				}
				active={settings.notification_end_status}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_end_status: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_end_status: checked,
						}));
					}}
					defaultChecked={settings.notification_end_status}
				/>
			</Setting>

			<Setting
				label={'Hold'}
				description={
					'Will the bot send a notification when a hold occurs?'
				}
				active={settings.notification_hold}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_hold: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_hold: checked,
						}));
					}}
					defaultChecked={settings.notification_hold}
				/>
			</Setting>

			<Setting
				label={'Liftoff'}
				description={
					'Will the bot send a notification when the rocket lifts off?'
				}
				active={settings.notification_liftoff}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_liftoff: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_liftoff: checked,
						}));
					}}
					defaultChecked={settings.notification_liftoff}
				/>
			</Setting>

			<Setting
				label={'Go for Launch'}
				description={
					'Will the bot send a notification when the launch is go?'
				}
				active={settings.notification_go}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_go: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_go: checked,
						}));
					}}
					defaultChecked={settings.notification_go}
				/>
			</Setting>

			<Setting
				label={'To Be Confirmed'}
				description={
					'Will the bot send a notification when the launch is to be confirmed?'
				}
				active={settings.notification_tbc}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_tbc: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_tbc: checked,
						}));
					}}
					defaultChecked={settings.notification_tbc}
				/>
			</Setting>

			<Setting
				label={'To Be Determined'}
				description={
					'Will the bot send a notification when the launch is to be determined?'
				}
				active={settings.notification_tbd}
			>
				<Switch
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_tbd: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_tbd: checked,
						}));
					}}
					defaultChecked={settings.notification_tbd}
				/>
			</Setting>
		</div>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
