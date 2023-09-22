'use client';

import { ll2_agencies, ll2_agencies_filter } from '@prisma/client';
import { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@components/ui/checkbox';
import { useDebounce } from '@lib/hooks';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { SetAgencies } from '@app/(dashboard)/agencies/actions';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Switch } from '@components/ui/switch';
import { Label } from '@components/ui/label';
import { Separator } from '@components/ui/separator';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Input } from '@components/ui/input';

interface ClientProps {
	agencies: ll2_agencies[];
	enabledAgencies: ll2_agencies_filter[];
	guild: string;
}

export interface Agency extends ll2_agencies {
	selected: boolean;
}

export default function Client({
	agencies,
	enabledAgencies,
	guild,
}: ClientProps) {
	const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>(
		agencies.map(a => ({
			...a,
			selected: !enabledAgencies.some(e => e.agency_id === a.agency_id),
		}))
	);
	const [settings, setSettings] = useState({
		whitelist: false,
	});
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const debounced = useDebounce(selectedAgencies, 1000);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		toast.promise(SetAgencies(selectedAgencies, guild), {
			loading: 'Saving...',
			success: 'Saved!',
			error: 'Failed to save!',
		});
	}, [debounced]);

	const filtered = selectedAgencies.filter(
		a => a.name?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex border rounded-md items-center justify-between space-x-2 p-4'>
				<div className='flex flex-col gap-2'>
					<Label htmlFor='toggle-whitelist'>Whitelist Mode</Label>
					<p className='text-sm opacity-50'>
						{
							"When on, only the agencies you've selected will be shown. Otherwise, the selected agencies will be hidden."
						}
					</p>
					<Separator />
					<p className='text-sm inline-flex items-center gap-2 opacity-60'>
						The selected agencies will be{' '}
						{settings.whitelist ? (
							<>
								shown <FaEye className='-mb-0.5' />
							</>
						) : (
							<>
								hidden <FaEyeSlash className='-mb-0.5' />
							</>
						)}
					</p>
				</div>
				<Switch
					id='toggle-whitelist'
					onCheckedChange={checked =>
						setSettings(prev => ({
							...prev,
							whitelist: checked as boolean,
						}))
					}
				/>
			</div>
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
										onCheckedChange={checked => {
											setSelectedAgencies(prev =>
												prev.map(a => ({
													...a,
													selected:
														(checked as boolean) ??
														false,
												}))
											);
										}}
									/>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className='w-full'>
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
												className='rounded-full bg-white'
											/>
										) : (
											<div
												className='flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1e1f22]'
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
