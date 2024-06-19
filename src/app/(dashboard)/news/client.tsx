'use client';

import { enabled_guilds, news_filter, news_sites } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { useDebounce } from '@lib/hooks';
import { cn } from '@lib/utils';
import { Input } from '@components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@components/ui/table';
import { Checkbox } from '@components/ui/checkbox';
import Image from 'next/image';
import {
	disableFeature,
	setNewsSites,
	updateChannel,
	updateSettings,
} from './actions';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Setting, SettingGroup } from '@components/ui/setting';
import { RESTGetAPIGuildChannelsResult } from 'discord.js';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@components/ui/select';
import toast from 'react-hot-toast';
import { FaHashtag } from 'react-icons/fa';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';
import { BiSolidMegaphone } from 'react-icons/bi';

interface ClientProps {
	newsSites: news_sites[];
	enabledNewsSites: news_filter[];
	guild: enabled_guilds;
	channels: RESTGetAPIGuildChannelsResult;
}

export interface NewsSite extends news_sites {
	selected: boolean;
}

export interface NewsSitesSettings {
	whitelist: boolean;
}

export default function Client({
	newsSites,
	enabledNewsSites,
	guild,
	channels,
}: ClientProps) {
	const router = useRouter();

	const [selectedNewsSites, setSelectedNewsSites] = useState<NewsSite[]>(
		newsSites.map(a => ({
			...a,
			selected: enabledNewsSites.some(
				e => e.news_site_id === a.news_site_id
			),
		}))
	);

	const [settings, setSettings] = useState<NewsSitesSettings>({
		whitelist: Boolean(guild.news_include_exclude),
	});
	const [selectedChannelID, setSelectedChannelID] = useState<
		string | undefined
	>(guild.news_channel_id?.toString());
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const debounced = useDebounce(selectedNewsSites, 1000 * 1.5);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		toast.promise(setNewsSites(selectedNewsSites, String(guild.guild_id)), {
			loading: 'Saving...',
			success: 'Saved!',
			error: 'Failed to save!',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced]);

	// sort by name, alphabetically
	const filtered = selectedNewsSites
		.filter(a =>
			a.news_site_name?.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			if (!a.news_site_name || !b.news_site_name) return 0;
			return a.news_site_name.localeCompare(b.news_site_name);
		});

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Feature'}>
				{guild.news_channel_id !== null && (
					<Setting
						label={'Disable Feature'}
						description={'Disable this feature for your server.'}
						active={false}
						className='flex flex-col gap-4'
						disabledMessage={
							"You can't disable this feature if it's not enabled"
						}
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
					label={'News Channel'}
					description={
						'Choose which channel the bot should send news to.'
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
										router.refresh();
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
						<SelectContent
							onCloseAutoFocus={e => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
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
			</SettingGroup>

			<SettingGroup title={'Exclusions'}>
				{'Whether to show or hide news sites'}
			</SettingGroup>
			<Setting
				label={'Exclusion Mode'}
				description={
					"When on 'Exclude' mode, all news sites will be used except for the ones you select. When on 'Include' mode, only the news sites you select will be used."
				}
				active={settings.whitelist}
				disabled={guild.news_channel_id === null}
				disabledMessage={'Requires a news channel to be set'}
			>
				<Tabs
					defaultValue={
						guild.agencies_include_exclude ? 'include' : 'exclude'
					}
					onValueChange={value => {
						updateSettings(String(guild.guild_id), {
							...settings,
							whitelist: value === 'include',
						});
						setSettings(prev => ({
							...prev,
							whitelist: value === 'include',
						}));
					}}
				>
					<TabsList>
						<TabsTrigger value='exclude'>Exclude</TabsTrigger>
						<TabsTrigger value='include'>Include</TabsTrigger>
					</TabsList>
				</Tabs>
			</Setting>
			<SettingGroup title={'Modify News Sites'}>
				Select the news sites you want to{' '}
				{settings.whitelist ? 'show' : 'hide'}.
				{guild.news_channel_id === null && (
					<span className='font-bold'>
						{' '}
						You need to set a news channel to use this feature.
					</span>
				)}
			</SettingGroup>
			<Input
				placeholder={'Search...'}
				onChange={e => {
					setSearchQuery(e.target.value.trim());
				}}
			/>
			<div className='flex border rounded-md flex-col overflow-hidden'>
				{filtered.length > 0 && guild.news_channel_id !== null ? (
					<Table className='overflow-scroll w-full'>
						<TableHeader className='border-b-2 h-14 font-medium bg-background'>
							<TableRow className='bg-muted/50 snap-start align-right'>
								<TableHead>Name</TableHead>
								<TableHead>
									<Checkbox
										className='grid place-items-center h-6 w-6 m-2 rounded-[5px]'
										checked={
											selectedNewsSites.every(
												a => a.selected
											) && selectedNewsSites.length > 0
										}
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											const checkbox =
												e.currentTarget as HTMLInputElement;
											checkbox.checked =
												!checkbox.checked;
											setSelectedNewsSites(prev =>
												prev.map(p => ({
													...p,
													selected: checkbox.checked,
												}))
											);
										}}
									/>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className='w-full cursor-pointer'>
							{filtered.map(a => (
								<TableRow
									key={a.news_site_id}
									className={cn(
										'hover:bg-foreground align-middle w-full h-8 h-18 hover:bg-muted/50',
										{
											'bg-muted/30': a.selected,
										}
									)}
									onMouseDown={e => {
										if (e.button === 0) {
											e.preventDefault();
											setSelectedNewsSites(prev =>
												prev.map(p =>
													p.news_site_id ===
													a.news_site_id
														? {
																...p,
																selected:
																	!p.selected,
															}
														: p
												)
											);
										}
									}}
									onMouseEnter={e => {
										if (e.buttons === 1) {
											e.preventDefault();
											setSelectedNewsSites(prev =>
												prev.map(p =>
													p.news_site_id ===
													a.news_site_id
														? {
																...p,
																selected:
																	!p.selected,
															}
														: p
												)
											);
										}
									}}
								>
									<TableCell className='inline-flex h-full items-center gap-2'>
										{a.logo_url ? (
											<Image
												src={a.logo_url}
												alt='Agency Logo'
												width={42}
												height={42}
												className='rounded-full bg-black'
											/>
										) : (
											<div
												className='flex h-[42px] w-[42px] items-center text-white justify-center rounded-full bg-[#1e1f22]'
												title={
													a.news_site_name ??
													'Unknown'
												}
											>
												{a.news_site_name?.[0]}
											</div>
										)}
										{a.news_site_name}
									</TableCell>
									<TableCell className='right-0 relative text-right align-bottom ml-auto'>
										<Checkbox
											name={`Checked ${a.news_site_name}? ${a.selected}`}
											checked={a.selected}
											className='grid place-items-center h-6 w-6 m-2 rounded-[5px]'
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onCheckedChange={checked => {
												setSelectedNewsSites(prev =>
													prev.map(p =>
														p.news_site_id ===
														a.news_site_id
															? {
																	...p,
																	selected:
																		(checked as boolean) ??
																		false,
																}
															: p
													)
												);
											}}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className='flex flex-col justify-center items-center h-full'>
						<p className='text-sm opacity-50 p-8'>
							There is nothing here
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
