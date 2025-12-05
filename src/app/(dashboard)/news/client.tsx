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
import type { RESTGetAPIGuildChannelsResult } from "discord.js";
import { FrownIcon, Hash, Megaphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { disableFeature, setNewsSites, updateChannel, updateSettings } from "./actions";

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

	// sort by name, alphabetically
	const filtered = selectedNewsSites
		.filter((a) => a.news_site_name?.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => {
			if (!a.news_site_name || !b.news_site_name) return 0;
			return a.news_site_name.localeCompare(b.news_site_name);
		});

	return (
		<div className="flex flex-col gap-4">
			<SettingGroup title={"News"}>
				{guild.news_channel_id !== null && (
					<Setting
						label={"Disable Feature"}
						description={"Disable this feature for your server."}
						active={false}
						className="flex flex-col gap-4"
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
												<Hash className="mr-2 inline-block" />
											) : (
												<Megaphone className="mr-2 inline-block" />
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
										<Hash className="mr-2 inline-block" />
									) : (
										<Megaphone className="mr-2 inline-block" />
									)}
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Setting>
			</SettingGroup>

			<SettingGroup title={"Exclusions"}>{"Whether to show or hide news sites"}</SettingGroup>
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
			<SettingGroup title={"Modify News Sites"}>
				Select the news sites you want to {settings.whitelist ? "show" : "hide"}.
				{guild.news_channel_id === null && (
					<span className="font-bold"> You need to set a news channel to use this feature.</span>
				)}
			</SettingGroup>
			<Input
				placeholder={"Search..."}
				onChange={(e) => {
					setSearchQuery(e.target.value.trim());
				}}
			/>
			<div className="flex flex-col overflow-hidden rounded-md border">
				{filtered.length > 0 && guild.news_channel_id !== null ? (
					<Table className="w-full overflow-scroll">
						<TableHeader className="h-14 border-b bg-background font-medium">
							<TableRow className="snap-start bg-muted/50 align-right">
								<TableHead>Name</TableHead>
								<TableHead>
									<Checkbox
										className="m-2 grid h-6 w-6 place-items-center rounded-[5px]"
										checked={
											selectedNewsSites.every((a) => a.selected) && selectedNewsSites.length > 0
										}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											const checkbox = e.currentTarget as HTMLInputElement;
											checkbox.checked = !checkbox.checked;
											setSelectedNewsSites((prev) =>
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
									key={a.news_site_id}
									className={cn(
										"h-18 h-8 w-full align-middle hover:bg-foreground hover:bg-muted/50",
										{
											"bg-muted/30": a.selected,
										},
									)}
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
												title={a.news_site_name ?? "Unknown"}
											>
												{a.news_site_name?.[0]}
											</div>
										)}
										{a.news_site_name}
									</TableCell>
									<TableCell className="relative right-0 ml-auto text-right align-bottom">
										<Checkbox
											name={`Checked ${a.news_site_name}? ${a.selected}`}
											checked={a.selected}
											className="m-2 grid h-6 w-6 place-items-center rounded-[5px]"
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
					<div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-8">
						<FrownIcon className="h-10 w-10" />
						<p className="text-sm opacity-50">No news sites matched your search query</p>
					</div>
				)}
			</div>
		</div>
	);
}
