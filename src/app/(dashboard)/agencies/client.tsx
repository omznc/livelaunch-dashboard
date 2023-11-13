'use client';

import {
	enabled_guilds,
	ll2_agencies,
	ll2_agencies_filter,
} from '@prisma/client';
import { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@components/ui/table';
import { Checkbox } from '@components/ui/checkbox';
import { useDebounce, useHash } from '@lib/hooks';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { SetAgencies, updateSettings } from '@app/(dashboard)/agencies/actions';
import toast from 'react-hot-toast';
import { Input } from '@components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Setting, SettingGroup } from '@components/ui/setting';

interface ClientProps {
	agencies: ll2_agencies[];
	enabledAgencies: ll2_agencies_filter[];
	guild: enabled_guilds;
}

export interface Agency extends ll2_agencies {
	selected: boolean;
}

export interface AgenciesSettings {
	whitelist: boolean;
}

export default function Client({
	agencies,
	enabledAgencies,
	guild,
}: ClientProps) {
	const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>(
		agencies.map(a => ({
			...a,
			selected: enabledAgencies.some(e => e.agency_id === a.agency_id),
		}))
	);
	const [settings, setSettings] = useState<AgenciesSettings>({
		whitelist: Boolean(guild.agencies_include_exclude),
	});
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const debounced = useDebounce(selectedAgencies, 1000 * 1.5);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		toast.promise(SetAgencies(selectedAgencies, String(guild.guild_id)), {
			loading: 'Saving...',
			success: 'Saved!',
			error: 'Failed to save!',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced]);

	const hash = useHash();

	const filtered = selectedAgencies
		.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			if (!a.name || !b.name) return 0;
			return a.name.localeCompare(b.name);
		});

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Exclusions'}>
				Whether to show or hide agencies
			</SettingGroup>
			<Setting
				label={'Exclusion Mode'}
				description={
					"When on 'Exclude' mode, all agencies will be shown except for the ones you select. When on 'Include' mode, only the agencies you select will be shown."
				}
				active={settings.whitelist}
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
			<SettingGroup title={'Modify Agencies'}>
				Select the agencies you want to{' '}
				{settings.whitelist ? 'show' : 'hide'}.
			</SettingGroup>
			<Input
				placeholder={'Search...'}
				onChange={e => {
					setSearchQuery(e.target.value.trim());
				}}
			/>
			<div className='flex border rounded-md flex-col overflow-hidden'>
				{filtered.length > 0 ? (
					<Table className='overflow-scroll w-full'>
						<TableHeader className='border-b-2 h-14 font-medium bg-background'>
							<TableRow className='bg-muted/50 snap-start align-right'>
								<TableHead>Name</TableHead>
								<TableHead>
									<Checkbox
										className='grid place-items-center h-6 w-6 m-2 rounded-[5px]'
										checked={
											selectedAgencies.every(
												a => a.selected
											) && selectedAgencies.length > 0
										}
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											const checkbox =
												e.currentTarget as HTMLInputElement;
											checkbox.checked =
												!checkbox.checked;
											setSelectedAgencies(prev =>
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
									key={a.agency_id}
									className={cn(
										'hover:bg-foreground align-middle w-full h-8 h-18 hover:bg-muted/50',
										{
											'bg-muted/30': a.selected,
										}
									)}
									onMouseDown={e => {
										if (e.button === 0) {
											e.preventDefault();
											setSelectedAgencies(prev =>
												prev.map(p =>
													p.agency_id === a.agency_id
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
											setSelectedAgencies(prev =>
												prev.map(p =>
													p.agency_id === a.agency_id
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
												title={a.name ?? 'Unknown'}
											>
												{a.name?.[0]}
											</div>
										)}
										{a.name}
									</TableCell>
									<TableCell className='right-0 relative text-right align-bottom ml-auto'>
										<Checkbox
											name={`Checked ${a.name}? ${a.selected}`}
											checked={a.selected}
											className='grid place-items-center h-6 w-6 m-2 rounded-[5px]'
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onCheckedChange={checked => {
												setSelectedAgencies(prev =>
													prev.map(p =>
														p.agency_id ===
														a.agency_id
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
							No agencies matched your search query
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
