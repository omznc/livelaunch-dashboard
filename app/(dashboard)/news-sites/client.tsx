'use client';

import { enabled_guilds, news_filter, news_sites } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useDebounce, useHash } from '@lib/hooks';
import { cn } from '@lib/utils';
import { Separator } from '@components/ui/separator';
import { FaArrowUp, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Switch } from '@components/ui/switch';
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
import { Label } from '@components/ui/label';
import { updateSettings } from '@app/(dashboard)/news-sites/actions';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Setting, SettingGroup } from '@components/setting';
import Link from 'next/link';

interface ClientProps {
	newsSites: news_sites[];
	enabledNewsSites: news_filter[];
	guild: enabled_guilds;
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
}: ClientProps) {
	const [selectedNewsSites, setSelectedNewsSites] = useState<NewsSite[]>(
		newsSites.map(a => ({
			...a,
			selected: !enabledNewsSites.some(
				e => e.news_site_id === a.news_site_id
			),
		}))
	);
	const [settings, setSettings] = useState<NewsSitesSettings>({
		whitelist: Boolean(guild.news_include_exclude),
	});
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const debounced = useDebounce(selectedNewsSites, 1000 * 1.5);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		console.log(debounced);
	}, [debounced]);

	const filtered = selectedNewsSites.filter(
		a => a.news_site_name?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const hash = useHash();

	return (
		<div className='flex flex-col gap-4'>
			<SettingGroup title={'Exclusions'} hash={hash}>
				{'Whether to show or hide news sites'}
			</SettingGroup>
			{/*<div*/}
			{/*	className={cn(*/}
			{/*		'flex border cursor-pointer hover:bg-muted/10 rounded-md items-center transition-all justify-between space-x-2 p-4',*/}
			{/*		{*/}
			{/*			'bg-muted/30': settings.whitelist,*/}
			{/*		}*/}
			{/*	)}*/}
			{/*>*/}
			{/*	<div className={cn('flex flex-col gap-2')}>*/}
			{/*		<Label htmlFor='toggle-whitelist'>Exclusion Mode</Label>*/}
			{/*		<p className='text-sm  select-none opacity-50'>*/}
			{/*			{*/}
			{/*				"When on 'Exclude' mode, all news sites will be used except for the ones you select. When on 'Include' mode, only the news sites you select will be used."*/}
			{/*			}*/}
			{/*		</p>*/}
			{/*		<Separator />*/}
			{/*		<p className='text-sm select-none inline-flex items-center gap-2 opacity-60'>*/}
			{/*			The selected news sites will be{' '}*/}
			{/*			{settings.whitelist ? (*/}
			{/*				<>*/}
			{/*					shown <FaEye className='-mb-0.5' />*/}
			{/*				</>*/}
			{/*			) : (*/}
			{/*				<>*/}
			{/*					hidden <FaEyeSlash className='-mb-0.5' />*/}
			{/*				</>*/}
			{/*			)}*/}
			{/*		</p>*/}
			{/*	</div>*/}
			{/*</div>*/}
			<Setting
				label={'Exclusion Mode'}
				description={
					"When on 'Exclude' mode, all news sites will be used except for the ones you select. When on 'Include' mode, only the news sites you select will be used."
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
			<SettingGroup title={'Modify Agencies'} hash={hash}>
				Select the news sites you want to{' '}
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
											selectedNewsSites.every(
												a => a.selected
											) && selectedNewsSites.length > 0
										}
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											setSelectedNewsSites(prev =>
												prev.map(p => ({
													...p,
													selected: !p.selected,
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
												className='rounded-full bg-white'
											/>
										) : (
											<div
												className='flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1e1f22]'
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
							No agencies matched your search query
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
