'use client';

import { enabled_guilds } from '@prisma/client';
import { FaArrowUp, FaHashtag } from 'react-icons/fa';
import { Switch } from '@components/ui/switch';
import React, { useEffect, useState } from 'react';
import {
	disableFeature,
	updateChannel,
	updateNumberOfEvents,
	updateSettings,
} from './actions';
import Link from 'next/link';
import { Setting, SettingGroup } from '@components/ui/setting';
import { RESTGetAPIGuildChannelsResult } from 'discord.js';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@components/ui/select';
import toast from 'react-hot-toast';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { useDebounce } from '@lib/hooks';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';

interface ClientProps {
	guild: enabled_guilds;
	channels: RESTGetAPIGuildChannelsResult;
}

export interface GeneralSettings {
	notification_button_fc: boolean;
	notification_button_g4l: boolean;
	notification_button_sln: boolean;
	se_launch: boolean;
	se_event: boolean;
	se_no_url: boolean;
}

export default function Client({ guild, channels }: ClientProps) {
	const router = useRouter();

	const [settings, setSettings] = useState<GeneralSettings>({
		notification_button_fc: Boolean(guild.notification_button_fc),
		notification_button_g4l: Boolean(guild.notification_button_g4l),
		notification_button_sln: Boolean(guild.notification_button_sln),
		se_launch: Boolean(guild.se_launch),
		se_event: Boolean(guild.se_event),
		se_no_url: Boolean(guild.se_no_url),
	});
	const [numberOfEvents, setNumberOfEvents] = useState<number>(
		guild.scheduled_events ?? 0
	);
	const [selectedChannelID, setSelectedChannelID] = useState<
		string | undefined
	>(guild.channel_id?.toString());
	const [mounted, setMounted] = useState(false);
	const debouncedNumberOfEvents = useDebounce(numberOfEvents, 1000);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		updateNumberOfEvents(
			String(guild.guild_id),
			debouncedNumberOfEvents
		).catch(() => {
			toast.error('Failed to save.');
		});
	}, [debouncedNumberOfEvents]);

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Feature'}></SettingGroup>
			<Setting
				label={'Disable Feature'}
				description={'Disable this feature for your server.'}
				active={false}
				className='flex flex-col gap-4'
				disabled={guild.channel_id === null}
			>
				<Button
					onClick={() => {
						toast.promise(disableFeature(String(guild.guild_id)), {
							loading: 'Disabling...',
							success: () => {
								setSelectedChannelID(undefined);
								return 'Disabled.';
							},
							error: 'Failed to disable.',
						});
					}}
					className='w-fit whitespace-nowrap'
					variant='outline'
				>
					Disable
				</Button>
			</Setting>
			<SettingGroup title={'General'}>
				{'Uncategorized, general settings.'}
			</SettingGroup>
			<Setting
				label={'Messages Channel'}
				description={
					'Choose which channel the bot should general messages to.'
				}
				active={false}
			>
				<Select
					onValueChange={value => {
						setSelectedChannelID(value);
						toast.promise(
							updateChannel(String(guild.guild_id), value),
							{
								loading: 'Saving...',
								success: 'Saved.',
								error: () => {
									router.refresh();
									return 'Failed to save.';
								},
							}
						);
					}}
				>
					<SelectTrigger className='w-full md:w-fit-content md:max-w-[350px]'>
						{(() => {
							const chan = channels.find(
								channel => channel.id === selectedChannelID
							);
							if (chan) {
								return (
									<span>
										<FaHashtag className='inline-block mr-2' />
										{chan.name}
									</span>
								);
							}
							return 'No channel selected';
						})()}
					</SelectTrigger>
					<SelectContent>
						{channels.map(channel => (
							<SelectItem
								key={channel.id}
								onClick={() => {
									console.log(channel);
								}}
								value={channel.id}
							>
								<FaHashtag className='inline-block mr-2' />
								{channel.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Setting>

			<SettingGroup title={'Buttons'}>
				{'Whether or not to show buttons in embeds.'}
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
				label={'Number of Events'}
				description={
					'How many events should the bot schedule at a time? Setting this to 0 will disable this feature, and accompanying settings.'
				}
				active={false}
			>
				<div className='grid max-w-sm items-center gap-1.5'>
					<Label htmlFor='events'>Events (0-50)</Label>
					<Input
						type='number'
						id='events'
						placeholder='Events'
						defaultValue={numberOfEvents}
						min={0}
						max={50}
						onChange={e => {
							e.target.value = clamp(
								e.target.valueAsNumber,
								0,
								50
							).toString();
							setNumberOfEvents(
								clamp(e.target.valueAsNumber, 0, 50)
							);
						}}
					/>
				</div>
			</Setting>
			<Setting
				label={'Launches'}
				description={
					'Will the bot schedule an event for space launches?'
				}
				active={settings.se_launch}
				disabled={numberOfEvents === 0}
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
				disabled={numberOfEvents === 0}
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
			<Setting
				label={'Hide Video-less Events'}
				description={
					'Will the bot hide events that do not have a video?'
				}
				active={settings.se_no_url}
				disabled={numberOfEvents === 0}
			>
				<Switch
					id={'toggle-se-no-url'}
					onCheckedChange={checked => {
						updateSettings(String(guild.guild_id), {
							...settings,
							se_no_url: checked,
						});
						setSettings(prev => ({
							...prev,
							se_no_url: checked,
						}));
					}}
					defaultChecked={settings.se_no_url}
				/>
			</Setting>
		</div>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
