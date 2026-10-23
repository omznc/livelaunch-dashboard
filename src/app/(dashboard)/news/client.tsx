"use client";

import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@components/ui/select";
import { Setting, SettingGroup } from "@components/ui/setting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import type { enabled_guilds, news_filter, news_sites } from "@generated/client";
import { useDebounce } from "@lib/hooks";
import { cn } from "@lib/utils";
import type { RESTGetAPIGuildChannelsResult } from "discord-api-types/v10";
import { FrownIcon, Hash, Megaphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { disableFeature, setNewsSites, updateChannel, updateSettings } from "./actions";

interface ClientProps {
	newsSites: news_sites[];
	enabledNewsSites: news_filter[];
	guild: Pick<enabled_guilds, "guild_id" | "news_channel_id" | "news_include_exclude">;
	channels: RESTGetAPIGuildChannelsResult;
}

export interface NewsSite extends news_sites {
	selected: boolean;
}

export interface NewsSitesSettings {
	whitelist: boolean;
}

export default function Client({ newsSites, enabledNewsSites, guild, channels }: ClientProps) {
	const router = useRouter();

	const [selectedNewsSites, setSelectedNewsSites] = useState<NewsSite[]>(
		newsSites.map((a) => ({
			...a,
			selected: enabledNewsSites.some((e) => e.news_site_id === a.news_site_id),
		})),
	);

	const [settings, setSettings] = useState<NewsSitesSettings>({
		whitelist: Boolean(guild.news_include_exclude),
	});
	const [selectedChannelID, setSelectedChannelID] = useState<string | undefined>(guild.news_channel_id?.toString());
	const [searchQuery, setSearchQuery] = useState("");

	const debouncedNewsSites = useDebounce(selectedNewsSites, 1000 * 1.5);
	const hydratedRef = useRef(false);
	const lastGuildIdRef = useRef(guild.guild_id);
	const lastSavedSnapshotRef = useRef<string>("");

	useEffect(() => {
		const snapshot = JSON.stringify(
			debouncedNewsSites.map(({ news_site_id, selected }) => ({ news_site_id, selected })),
		);
		const first = !hydratedRef.current || lastGuildIdRef.current !== guild.guild_id;
		hydratedRef.current = true;
		lastGuildIdRef.current = guild.guild_id;
		if (first) {
			lastSavedSnapshotRef.current = snapshot;
			return;
		}
		if (snapshot === lastSavedSnapshotRef.current) return;
		lastSavedSnapshotRef.current = snapshot;

		toast.promise(setNewsSites({ guildId: String(guild.guild_id), newsSites: debouncedNewsSites }), {
			loading: "Saving...",
			success: "Saved!",
			error: "Failed to save!",
		});
	}, [debouncedNewsSites, guild.guild_id]);

	const allSelected = selectedNewsSites.length > 0 && selectedNewsSites.every((a) => a.selected);

	// sort by name, alphabetically
	const filtered = selectedNewsSites
		.filter((a) => a.news_site_name?.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			if (!a.news_site_name || !b.news_site_name) return 0;
			return a.news_site_name.localeCompare(b.news_site_name);
		});

	return (
		<div className="flex flex-col gap-10">
			<SettingGroup title={"News"}>
				{guild.news_channel_id !== null && (
					<Setting
						label={"Disable Feature"}
						description={"Disable this feature for your server."}
						active={false}
						disabledMessage={"You can't disable this feature if it's not enabled"}
					>
						<Button
							onClick={() => {
								toast.promise(disableFeature({ guildId: String(guild.guild_id) }), {
									loading: "Disabling...",
									success: () => {
										setSelectedChannelID(undefined);
										return "Disabled.";
									},
									error: "Failed to disable.",
								});
							}}
							className="w-fit whitespace-nowrap"
							variant="outline"
						>
							Disable
						</Button>
					</Setting>
				)}
				<Setting
					label={"News Channel"}
					description={"Choose which channel the bot should send news to."}
					active={false}
				>
					<Select
						onValueChange={(value) => {
							setSelectedChannelID(value);
							toast.promise(updateChannel({ guildId: String(guild.guild_id), channelId: value }), {
								loading: "Saving...",
								success: (r) => {
									if (!r.data?.success) throw new Error(r.serverError);
									return "Saved";
								},
								error: (e?: Error) => {
									router.refresh();
									setSelectedChannelID(undefined);
									return e ? e.message : "Failed to save.";
								},
							});
						}}
						key={selectedChannelID}
					>
						<SelectTrigger className="w-full md:w-fit md:max-w-[350px]">
							{(() => {
								const chan = channels.find((channel) => channel.id === selectedChannelID);
								if (chan) {
									return (
										<span>
											{chan.type === 0 ? (
												<Hash className="mr-2 inline-block h-4 w-4" />
											) : (
												<Megaphone className="mr-2 inline-block h-4 w-4" />
											)}
											{chan.name}
										</span>
									);
								}
								return "No channel selected";
							})()}
						</SelectTrigger>
						<SelectContent
							onCloseAutoFocus={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							{channels.map((channel) => (
								<SelectItem key={channel.id} value={channel.id}>
									{channel.type === 0 ? (
										<Hash className="mr-2 inline-block h-4 w-4" />
									) : (
										<Megaphone className="mr-2 inline-block h-4 w-4" />
									)}
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Setting>
			</SettingGroup>

			<SettingGroup title={"Exclusions"} description={"Whether to show or hide news sites"}>
				<Setting
					label={"Exclusion Mode"}
					description={
						"When on 'Exclude' mode, all news sites will be used except for the ones you select. When on 'Include' mode, only the news sites you select will be used."
					}
					active={settings.whitelist}
					disabled={guild.news_channel_id === null}
					disabledMessage={"Requires a news channel to be set"}
				>
					<Tabs
						defaultValue={guild.news_include_exclude ? "include" : "exclude"}
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
				title={"Modify News Sites"}
				description={
					<>
						Select the news sites you want to {settings.whitelist ? "show" : "hide"}.
						{guild.news_channel_id === null && (
							<span className="text-amber"> You need to set a news channel to use this feature.</span>
						)}
					</>
				}
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
					{filtered.length > 0 && guild.news_channel_id !== null ? (
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
												setSelectedNewsSites((prev) =>
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
										key={a.news_site_id}
										className={cn("w-full select-none align-middle", {
											"bg-primary/[0.07]": a.selected,
										})}
										onMouseDown={(e) => {
											if (e.button === 0) {
												e.preventDefault();
												setSelectedNewsSites((prev) =>
													prev.map((p) =>
														p.news_site_id === a.news_site_id
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
												setSelectedNewsSites((prev) =>
													prev.map((p) =>
														p.news_site_id === a.news_site_id
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
														title={a.news_site_name ?? "Unknown"}
													>
														{a.news_site_name?.[0]}
													</div>
												)}
												{a.news_site_name}
											</div>
										</TableCell>
										<TableCell className="w-12 text-right align-middle">
											<Checkbox
												name={`Checked ${a.news_site_name}? ${a.selected}`}
												checked={a.selected}
												className="m-2 h-5 w-5"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onCheckedChange={(checked) => {
													setSelectedNewsSites((prev) =>
														prev.map((p) =>
															p.news_site_id === a.news_site_id
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
							<p className="text-fg2 text-sm">No news sites matched your search query</p>
						</div>
					)}
				</div>
			</SettingGroup>
		</div>
	);
}
