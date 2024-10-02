'use client';

import { enabled_guilds, notification_countdown } from '@prisma/client';
import { FaHashtag, FaTimes } from 'react-icons/fa';
import { BiSolidMegaphone } from 'react-icons/bi';
import React, { useState } from 'react';
import {
	addCountdown,
	disableFeature,
	removeCountdown,
	updateChannel,
	updateFilters,
} from './actions';
import { Switch } from '@components/ui/switch';
import { Setting, SettingGroup } from '@components/ui/setting';
import toast from 'react-hot-toast';
import { RESTGetAPIGuildChannelsResult } from 'discord.js';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@components/ui/select';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { DialogBody } from 'next/dist/client/components/react-dev-overlay/internal/components/Dialog';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Badge } from '@components/ui/badge';
import { useRouter } from 'next/navigation';

interface ClientProps {
	guild: enabled_guilds;
	countdowns: notification_countdown[];
	channels: RESTGetAPIGuildChannelsResult;
}

export interface CountdownSetting {
	days: number;
	hours: number;
	minutes: number;
}

export interface NotificationsFilterSettings {
	notification_end_status: boolean;
	notification_deploy: boolean;
	notification_hold: boolean;
	notification_go: boolean;
	notification_liftoff: boolean;
	notification_tbc: boolean;
	notification_tbd: boolean;
	notification_t0_change: boolean;
	notification_launch: boolean;
	notification_event: boolean;
}

export default function Client({ guild, countdowns, channels }: ClientProps) {
	const router = useRouter();

	const [settings, setSettings] = useState<NotificationsFilterSettings>({
		notification_end_status: Boolean(guild.notification_end_status),
		notification_deploy: Boolean(guild.notification_deploy),
		notification_hold: Boolean(guild.notification_hold),
		notification_liftoff: Boolean(guild.notification_liftoff),
		notification_go: Boolean(guild.notification_go),
		notification_tbc: Boolean(guild.notification_tbc),
		notification_tbd: Boolean(guild.notification_tbd),
		notification_t0_change: Boolean(guild.notification_t0_change),
		notification_launch: Boolean(guild.notification_launch),
		notification_event: Boolean(guild.notification_event),
	});

	const [selectedChannelID, setSelectedChannelID] = useState<
		string | undefined
	>(guild.notification_channel_id?.toString());

	const [newCountdown, setNewCountdown] = useState<CountdownSetting>({
		days: 0,
		hours: 0,
		minutes: 0,
	});

	const resetNewCountdown = () => {
		setNewCountdown({
			days: 0,
			hours: 0,
			minutes: 0,
		});
	};

	const [addCountdownDialogOpen, setAddCountdownDialogOpen] = useState(false);

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup
				title={'Notifications'}
				description={'Settings for the notification feature.'}
			>
				{guild.notification_channel_id !== null && (
					<Setting
						label={'Disable Feature'}
						description={'Disable this feature for your server.'}
						active={false}
						className='flex flex-col gap-4'
					>
						<Button
							onClick={() => {
								toast.promise(
									disableFeature(String(guild.guild_id)),
									{
										loading: 'Disabling...',
										success: () => {
											setSelectedChannelID(undefined);
											return 'Disabled.';
										},
										error: 'Failed to disable.',
									}
								);
							}}
							className='w-fit whitespace-nowrap'
							variant='outline'
						>
							Disable
						</Button>
					</Setting>
				)}
				<Setting
					label={'Notification Channel'}
					description={
						'Choose which channel the bot should send notifications to. Setting this enables this feature.'
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
									success: r => {
										if (r) throw new Error(r);
										return 'Saved';
									},
									error: (e?: Error) => {
										setSelectedChannelID(undefined);
										return e
											? e.message
											: 'Failed to save.';
									},
								}
							);
						}}
						key={selectedChannelID}
					>
						<SelectTrigger className='w-full md:w-fit-content md:max-w-[350px]'>
							{(() => {
								const chan = channels.find(
									channel => channel.id === selectedChannelID
								);
								if (chan) {
									return (
										<span>
											{chan.type === 0 ? (
												<FaHashtag className='inline-block mr-2' />
											) : (
												<BiSolidMegaphone className='inline-block mr-2' />
											)}
											{chan.name}
										</span>
									);
								}
								return 'No channel selected';
							})()}
						</SelectTrigger>
						<SelectContent>
							{channels.map(channel => (
								<SelectItem key={channel.id} value={channel.id}>
									{channel.type === 0 ? (
										<FaHashtag className='inline-block mr-2' />
									) : (
										<BiSolidMegaphone className='inline-block mr-2' />
									)}
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Setting>
				<Setting
					label={'Notification Countdown'}
					description={
						'Set how long before a launch the bot should send a notification.'
					}
					active={false}
					className='flex flex-col gap-4'
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Dialog
						open={addCountdownDialogOpen}
						onOpenChange={setAddCountdownDialogOpen}
					>
						<Button
							onClick={() => {
								resetNewCountdown();
								setAddCountdownDialogOpen(true);
							}}
							className='w-fit whitespace-nowrap'
							variant='outline'
						>
							Add a Countdown
						</Button>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add a Countdown</DialogTitle>
								<DialogDescription>
									{`Let's create a new countdown. You can add ${
										64 - countdowns.length
									} more.`}
								</DialogDescription>
							</DialogHeader>
							<DialogBody className='justify-center flex flex-col sm:justify-start gap-4'>
								<div className='flex gap-2 items-center'>
									<div className='grid max-w-sm items-center gap-1.5'>
										<Label htmlFor='days'>
											Days (0-31)
										</Label>
										<Input
											type='number'
											id='days'
											placeholder='Days'
											defaultValue={0}
											min={0}
											max={31}
											onChange={e => {
												e.target.value = clamp(
													e.target.valueAsNumber,
													0,
													31
												).toString();
												setNewCountdown(prev => ({
													...prev,
													days: e.target
														.valueAsNumber,
												}));
											}}
										/>
									</div>
									<div className='grid max-w-sm items-center gap-1.5'>
										<Label htmlFor='hours'>
											Hours (0-24)
										</Label>
										<Input
											type='number'
											id='hours'
											placeholder='Hours'
											defaultValue={0}
											min={0}
											max={24}
											onChange={e => {
												e.target.value = clamp(
													e.target.valueAsNumber,
													0,
													24
												).toString();
												setNewCountdown(prev => ({
													...prev,
													hours: e.target
														.valueAsNumber,
												}));
											}}
										/>
									</div>
									<div className='grid max-w-sm items-center gap-1.5'>
										<Label htmlFor='minutes'>
											Minutes (0-60)
										</Label>
										<Input
											type='number'
											id='minutes'
											placeholder='Minutes'
											defaultValue={0}
											min={0}
											max={60}
											onChange={e => {
												e.target.value = clamp(
													e.target.valueAsNumber,
													0,
													60
												).toString();
												setNewCountdown(prev => ({
													...prev,
													minutes:
														e.target.valueAsNumber,
												}));
											}}
										/>
									</div>
								</div>
								{`That would be ${
									newCountdown.days * 24 * 60 +
									newCountdown.hours * 60 +
									newCountdown.minutes
								} minutes beforehand.`}
							</DialogBody>
							<DialogFooter>
								<Button
									variant='outline'
									onClick={() =>
										setAddCountdownDialogOpen(false)
									}
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										addCountdown(
											String(guild.guild_id),
											newCountdown
										).catch(() => {
											toast.error(
												'Failed to add countdown.'
											);
										});
										setAddCountdownDialogOpen(false);
									}}
								>
									Add
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</Setting>
				<h2 className='text-sm'>
					{countdowns.length > 0
						? 'Current Countdowns'
						: "This is where you'd see your countdowns, if you had any."}
				</h2>
				<div className='flex flex-wrap gap-2'>
					{countdowns.map(countdown => (
						<Badge
							key={`${countdown.guild_id}-${countdown.minutes}`}
							className='group hover:gap-2'
						>
							{(() => {
								const days = Math.floor(
									countdown.minutes / 60 / 24
								);
								const hours =
									Math.floor(countdown.minutes / 60) % 24;
								const minutes = countdown.minutes % 60;

								return (
									<div className='flex gap-1 items-center'>
										{days > 0 && (
											<span className='text-sm'>
												{days} day
												{days > 1 ? 's' : ''}
											</span>
										)}
										{hours > 0 && (
											<span className='text-sm'>
												{hours} hour
												{hours > 1 ? 's' : ''}
											</span>
										)}
										{minutes > 0 && (
											<span className='text-sm'>
												{minutes} minute
												{minutes > 1 ? 's' : ''}
											</span>
										)}
									</div>
								);
							})()}
							<FaTimes
								onClick={() => {
									removeCountdown(
										String(guild.guild_id),
										countdown.minutes
									).catch(() => {
										toast.error(
											'Failed to remove countdown.'
										);
									});
								}}
								className='w-0 invisible cursor-pointer group-hover:visible group-hover:w-2 transition-all'
							/>
						</Badge>
					))}
				</div>
			</SettingGroup>

			<SettingGroup
				title={'General Filtering'}
				description={
					'Other filters that can be applied to notifications.'
				}
			>
				<Setting
					label={'T-0 Change'}
					description={
						'Will the bot send a notification when the launch time changes?'
					}
					active={settings.notification_t0_change}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
								...settings,
								notification_t0_change: checked,
							});
							setSettings(prev => ({
								...prev,
								notification_t0_change: checked,
							}));
						}}
						defaultChecked={settings.notification_t0_change}
					/>
				</Setting>

				<Setting
					label={'Launch'}
					description={
						'Will the bot send notifications for launches?'
					}
					active={settings.notification_launch}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
								...settings,
								notification_launch: checked,
							});
							setSettings(prev => ({
								...prev,
								notification_launch: checked,
							}));
						}}
						defaultChecked={settings.notification_launch}
					/>
				</Setting>

				<Setting
					label={'Event'}
					description={
						'Will the bot send notifications for space events?'
					}
					active={settings.notification_event}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
								...settings,
								notification_event: checked,
							});
							setSettings(prev => ({
								...prev,
								notification_event: checked,
							}));
						}}
						defaultChecked={settings.notification_event}
					/>
				</Setting>
			</SettingGroup>

			<SettingGroup
				title={'Status Filtering'}
				description={
					'Choose which launch statuses the bot should send notifications for.'
				}
			>
				<Setting
					label={'End Status'}
					description={
						'Will the bot send a notification when the launch recieves an end status?'
					}
					active={settings.notification_end_status}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
					label={'Payload Deployed'}
					description={
						'Will the bot send a notification when the payload deploys?'
					}
					active={settings.notification_deploy}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
								...settings,
								notification_deploy: checked,
							});
							setSettings(prev => ({
								...prev,
								notification_deploy: checked,
							}));
						}}
						defaultChecked={settings.notification_deploy}
					/>
				</Setting>

				<Setting
					label={'Hold'}
					description={
						'Will the bot send a notification when a hold occurs?'
					}
					active={settings.notification_hold}
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
					disabled={guild.notification_channel_id === null}
					disabledMessage={
						'Requires a notification channel to be set'
					}
				>
					<Switch
						onCheckedChange={checked => {
							updateFilters(String(guild.guild_id), {
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
			</SettingGroup>
		</div>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
