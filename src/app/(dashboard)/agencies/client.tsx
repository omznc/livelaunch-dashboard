"use client";

import { SetAgencies, updateSettings } from "@app/(dashboard)/agencies/actions";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Setting, SettingGroup } from "@components/ui/setting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import type { enabled_guilds, ll2_agencies, ll2_agencies_filter } from "@generated/client";
import { cn } from "@lib/utils";
import { FrownIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function Client({ agencies, enabledAgencies, guild }: ClientProps) {
	const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>(
		agencies.map((a) => ({
			...a,
			selected: enabledAgencies.some((e) => e.agency_id === a.agency_id),
		})),
	);
	const [settings, setSettings] = useState<AgenciesSettings>({
		whitelist: Boolean(guild.agencies_include_exclude),
	});
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			return;
		}
		toast.promise(SetAgencies({ guildId: String(guild.guild_id), agencies: selectedAgencies }), {
			loading: "Saving...",
			success: "Saved!",
			error: "Failed to save!",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [guild.guild_id, mounted, selectedAgencies]);

	const filtered = selectedAgencies
		.filter((a) => a.name?.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			if (!a.name || !b.name) return 0;
			return a.name.localeCompare(b.name);
		});

	return (
		<div className="flex flex-col gap-4">
			<SettingGroup title={"Exclusions"} description="Whether to show or hide agencies">
				<Setting
					label={"Exclusion Mode"}
					description={
						"When on 'Exclude' mode, all agencies will be shown except for the ones you select. When on 'Include' mode, only the agencies you select will be shown."
					}
					active={settings.whitelist}
				>
					<Tabs
						defaultValue={guild.agencies_include_exclude ? "include" : "exclude"}
						onValueChange={(value) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									whitelist: value === "include",
								},
							});
							setSettings((prev) => ({
								...prev,
								whitelist: value === "include",
							}));
						}}
					>
						<TabsList>
							<TabsTrigger value="exclude">Exclude</TabsTrigger>
							<TabsTrigger value="include">Include</TabsTrigger>
						</TabsList>
					</Tabs>
				</Setting>
			</SettingGroup>

			<SettingGroup
				title={"Modify Agencies"}
				description={<>Select the agencies you want to {settings.whitelist ? "show" : "hide"}.</>}
			>
				<Input
					placeholder={"Search..."}
					onChange={(e) => {
						setSearchQuery(e.target.value.trim());
					}}
				/>
				<div className="flex flex-col overflow-hidden rounded-md border">
					{filtered.length > 0 ? (
						<Table className="w-full overflow-scroll">
							<TableHeader className="h-14 border-b bg-background font-medium">
								<TableRow className="snap-start bg-muted/50 align-right">
									<TableHead>Name</TableHead>
									<TableHead>
										<Checkbox
											className="m-2 grid h-6 w-6 place-items-center rounded-[5px]"
											checked={
												selectedAgencies.every((a) => a.selected) && selectedAgencies.length > 0
											}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												const checkbox = e.currentTarget as HTMLInputElement;
												checkbox.checked = !checkbox.checked;
												setSelectedAgencies((prev) =>
													prev.map((p) => ({
														...p,
														selected: checkbox.checked,
													})),
												);
											}}
										/>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="w-full cursor-pointer">
								{filtered.map((a) => (
									<TableRow
										key={a.agency_id}
										className={cn(
											"h-18 h-8 w-full align-middle hover:bg-foreground hover:bg-muted/50",
											{
												"bg-muted/30": a.selected,
											},
										)}
										onMouseDown={(e) => {
											if (e.button === 0) {
												e.preventDefault();
												setSelectedAgencies((prev) =>
													prev.map((p) =>
														p.agency_id === a.agency_id
															? {
																	...p,
																	selected: !p.selected,
																}
															: p,
													),
												);
											}
										}}
										onMouseEnter={(e) => {
											if (e.buttons === 1) {
												e.preventDefault();
												setSelectedAgencies((prev) =>
													prev.map((p) =>
														p.agency_id === a.agency_id
															? {
																	...p,
																	selected: !p.selected,
																}
															: p,
													),
												);
											}
										}}
									>
										<TableCell className="inline-flex h-full items-center gap-2">
											{a.logo_url ? (
												<Image
													src={a.logo_url}
													alt="Agency Logo"
													width={42}
													height={42}
													className="rounded-full bg-black"
												/>
											) : (
												<div
													className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1e1f22] text-white"
													title={a.name ?? "Unknown"}
												>
													{a.name?.[0]}
												</div>
											)}
											{a.name}
										</TableCell>
										<TableCell className="relative right-0 ml-auto text-right align-bottom">
											<Checkbox
												name={`Checked ${a.name}? ${a.selected}`}
												checked={a.selected}
												className="m-2 grid h-6 w-6 place-items-center rounded-[5px]"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onCheckedChange={(checked) => {
													setSelectedAgencies((prev) =>
														prev.map((p) =>
															p.agency_id === a.agency_id
																? {
																		...p,
																		selected: (checked as boolean) ?? false,
																	}
																: p,
														),
													);
												}}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-8">
							<FrownIcon className="h-10 w-10" />
							<p className="text-sm opacity-50">No agencies matched your search query</p>
						</div>
					)}
				</div>
			</SettingGroup>
		</div>
	);
}
