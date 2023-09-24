'use client';

import { enabled_guilds } from '@prisma/client';
import { FaArrowUp } from 'react-icons/fa';
import { Switch } from '@components/ui/switch';
import { useState } from 'react';
import { updateSettings } from '@app/(dashboard)/general/actions';
import Link from 'next/link';
import { Setting, SettingGroup } from '@components/ui/setting';

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

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Buttons'}>
				{'Whether or not to show the notification buttons in embeds.'}
				<Link
					href={'https://i.imgur.com/ZFi4hEt.png'}
					target={'_blank'}
					className='inline-flex items-center gap-1 brightness-125 hover:underline'
				>
					Example <FaArrowUp className='rotate-45' />
				</Link>
			</SettingGroup>
			<Setting
				label={'Flight Club'}
				description={'Show the Flight Club button in embeds.'}
				active={settings.notification_button_fc}
				image={
					'https://cdn.discordapp.com/emojis/972885637436964946.webp'
				}
			>
				<Switch
					id={'toggle-fc'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_button_fc: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_button_fc: checked,
						}));
					}}
					defaultChecked={settings.notification_button_fc}
				/>
			</Setting>
			<Setting
				label={'Go4Liftoff'}
				description={'Show the Go4Liftoff button in embeds.'}
				active={settings.notification_button_g4l}
				image={
					'https://cdn.discordapp.com/emojis/970384895593562192.webp'
				}
			>
				<Switch
					id={'toggle-g4l'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_button_g4l: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_button_g4l: checked,
						}));
					}}
					defaultChecked={settings.notification_button_g4l}
				/>
			</Setting>
			<Setting
				label={'Space Launch Now'}
				description={'Show the Space Launch Now button in embeds.'}
				active={settings.notification_button_sln}
				image={
					'https://cdn.discordapp.com/emojis/970384894985379960.webp?size=56&quality=lossless'
				}
			>
				<Switch
					id={'toggle-sln'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							notification_button_sln: checked,
						});
						setSettings(prev => ({
							...prev,
							notification_button_sln: checked,
						}));
					}}
					defaultChecked={settings.notification_button_sln}
				/>
			</Setting>

			<SettingGroup title={'Scheduled Events'}>
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
			</SettingGroup>
			<Setting
				label={'Launches'}
				description={
					'Will the bot schedule an event for space launches?'
				}
				active={settings.se_launch}
			>
				<Switch
					id={'toggle-se-launch'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							se_launch: checked,
						});
						setSettings(prev => ({
							...prev,
							se_launch: checked,
						}));
					}}
					defaultChecked={settings.se_launch}
				/>
			</Setting>
			<Setting
				label={'Events'}
				description={'Will the bot schedule an event for space events?'}
				active={settings.se_event}
			>
				<Switch
					id={'toggle-se-event'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							se_event: checked,
						});
						setSettings(prev => ({
							...prev,
							se_event: checked,
						}));
					}}
					defaultChecked={settings.se_event}
				/>
			</Setting>
		</div>
	);
}
