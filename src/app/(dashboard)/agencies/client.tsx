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
import { type MouseEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface ClientProps {
	agencies: ll2_agencies[];
	enabledAgencies: ll2_agencies_filter[];
	guild: Pick<enabled_guilds, "guild_id" | "agencies_include_exclude">;
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
	const [searchQuery, setSearchQuery] = useState("");
	const hydratedRef = useRef(false);
	const lastGuildIdRef = useRef(guild.guild_id);
	const lastSavedSnapshotRef = useRef<string>("");

	useEffect(() => {
		const snapshot = JSON.stringify(selectedAgencies.map(({ agency_id, selected }) => ({ agency_id, selected })));
		const first = !hydratedRef.current || lastGuildIdRef.current !== guild.guild_id;
		hydratedRef.current = true;
		lastGuildIdRef.current = guild.guild_id;
		if (first) {
			lastSavedSnapshotRef.current = snapshot;
			return;
		}
		if (snapshot === lastSavedSnapshotRef.current) return;
		lastSavedSnapshotRef.current = snapshot;

		toast.promise(SetAgencies({ guildId: String(guild.guild_id), agencies: selectedAgencies }), {
			loading: "Saving...",
			success: "Saved!",
			error: "Failed to save!",
		});
	}, [selectedAgencies, guild.guild_id]);

	const filtered = selectedAgencies
		.filter((a) => a.name?.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			if (!a.name || !b.name) return 0;
			return a.name.localeCompare(b.name);
		});

	const allSelected = selectedAgencies.length > 0 && selectedAgencies.every((a) => a.selected);

	return (
		<div className="flex flex-col gap-10">
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
					aria-label="Search"
					className="h-11 border-x-0 border-t-0 border-line bg-transparent px-4"
					onChange={(e) => {
						setSearchQuery(e.target.value.trim());
					}}
				/>
				<div className="flex flex-col">
					{filtered.length > 0 ? (
						<Table className="w-full overflow-scroll">
							<TableHeader className="border-b border-line">
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>
										<Checkbox
											className="m-2 h-5 w-5"
											checked={allSelected}
											onClick={(e: MouseEvent<HTMLButtonElement>) => {
												e.preventDefault();
												e.stopPropagation();
												setSelectedAgencies((prev) =>
													prev.map((p) => ({
														...p,
														selected: !allSelected,
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
										className={cn("w-full select-none align-middle", {
											"bg-primary/[0.07]": a.selected,
										})}
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
										<TableCell>
											<div className="flex items-center gap-3">
												{a.logo_url ? (
													<Image
														src={a.logo_url}
														alt="Agency Logo"
														width={28}
														height={28}
														className="h-7 w-7 shrink-0 border border-line bg-bg object-contain"
													/>
												) : (
													<div
														className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-raised font-mono text-fg2 text-xs uppercase"
														title={a.name ?? "Unknown"}
													>
														{a.name?.[0]}
													</div>
												)}
												{a.name}
											</div>
										</TableCell>
										<TableCell className="w-12 text-right align-middle">
											<Checkbox
												name={`Checked ${a.name}? ${a.selected}`}
												checked={a.selected}
												className="m-2 h-5 w-5"
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
						<div className="flex flex-col items-center justify-center gap-3 p-8">
							<FrownIcon className="h-5 w-5 text-fg3" />
							<p className="text-fg2 text-sm">No agencies matched your search query</p>
						</div>
					)}
				</div>
			</SettingGroup>
		</div>
	);
}
