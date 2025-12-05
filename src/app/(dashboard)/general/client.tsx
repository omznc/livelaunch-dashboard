"use client";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@components/ui/select";
import { Setting, SettingGroup } from "@components/ui/setting";
import { Switch } from "@components/ui/switch";
import type { enabled_guilds } from "@generated/client";
import { useDebounce } from "@lib/hooks";
import type { RESTGetAPIGuildChannelsResult } from "discord.js";
import { ArrowUp, Hash, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { disableFeature, updateChannel, updateNumberOfEvents, updateSettings } from "./actions";

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
	const [settings, setSettings] = useState<GeneralSettings>({
		notification_button_fc: Boolean(guild.notification_button_fc),
		notification_button_g4l: Boolean(guild.notification_button_g4l),
		notification_button_sln: Boolean(guild.notification_button_sln),
		se_launch: Boolean(guild.se_launch),
		se_event: Boolean(guild.se_event),
		se_no_url: Boolean(guild.se_no_url),
	});
	const [numberOfEvents, setNumberOfEvents] = useState<number>(guild.scheduled_events ?? 0);
	const [selectedChannelID, setSelectedChannelID] = useState<string | undefined>(guild.channel_id?.toString());
	const hydratedRef = useRef(false);
	const lastGuildIdRef = useRef(guild.guild_id);
	const lastSavedRef = useRef<number>(guild.scheduled_events ?? 0);
	const debounced = useDebounce(numberOfEvents, 1000);

	useEffect(() => {
		const first = !hydratedRef.current || lastGuildIdRef.current !== guild.guild_id;
		hydratedRef.current = true;
		lastGuildIdRef.current = guild.guild_id;

		if (first) {
			lastSavedRef.current = debounced;
			return;
		}
		if (debounced === lastSavedRef.current) return;

		updateNumberOfEvents({ guildId: String(guild.guild_id), num: debounced })
			.then(() => {
				lastSavedRef.current = debounced;
			})
			.catch(() => {
				toast.error("Failed to save.");
			});
	}, [debounced, guild.guild_id]);

	return (
		<div className="flex flex-col gap-4">
			<SettingGroup title={"Videos"}>
				{guild.channel_id !== null ? (
					<Setting
						label={"Disable Feature"}
						description={"Disable this feature for your server."}
						active={false}
						className="flex flex-col gap-4"
						disabled={guild.channel_id === null}
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
				) : undefined}
				<Setting
					label={"Video Channel"}
					description={"Choose which channel the bot should send YouTube videos to."}
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
						<SelectContent>
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

			<SettingGroup
				title={"Buttons"}
				description={
					<>
						{"Whether or not to show buttons in embeds."}
						<Link
							href={"https://i.imgur.com/ZFi4hEt.png"}
							target={"_blank"}
							className="inline-flex items-center gap-1 brightness-125 hover:underline"
						>
							Example <ArrowUp className="rotate-45" />
						</Link>
					</>
				}
			>
				<Setting
					label={"Flight Club"}
					description={"Show the Flight Club button in embeds."}
					active={settings.notification_button_fc}
					image={"https://juststephen.com/LiveLaunch/button_logo/FlightClub.png"}
				>
					<Switch
						id={"toggle-fc"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_button_fc: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_button_fc: checked,
							}));
						}}
						defaultChecked={settings.notification_button_fc}
					/>
				</Setting>
				<Setting
					label={"Go4Liftoff"}
					description={"Show the Go4Liftoff button in embeds."}
					active={settings.notification_button_g4l}
					image={"https://juststephen.com/LiveLaunch/button_logo/Go4Liftoff.png"}
				>
					<Switch
						id={"toggle-g4l"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_button_g4l: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_button_g4l: checked,
							}));
						}}
						defaultChecked={settings.notification_button_g4l}
					/>
				</Setting>
				<Setting
					label={"Space Launch Now"}
					description={"Show the Space Launch Now button in embeds."}
					active={settings.notification_button_sln}
					image={"https://juststephen.com/LiveLaunch/button_logo/SpaceLaunchNow.png"}
				>
					<Switch
						id={"toggle-sln"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_button_sln: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_button_sln: checked,
							}));
						}}
						defaultChecked={settings.notification_button_sln}
					/>
				</Setting>
			</SettingGroup>

			<SettingGroup
				title={"Scheduled Events"}
				description={
					<>
						{"What kinds of events will the bot create?"}
						<Link
							href={"https://support.discord.com/hc/en-us/articles/4409494125719-Scheduled-Events"}
							target={"_blank"}
							className="inline-flex items-center gap-1 brightness-125 hover:underline"
						>
							Learn more <ArrowUp className="rotate-45" />
						</Link>
					</>
				}
			>
				<Setting
					label={"Number of Events"}
					description={
						"How many events should the bot schedule at a time? Setting this to 0 will disable this feature, and accompanying settings."
					}
					active={false}
				>
					<div className="grid max-w-sm items-center gap-1.5">
						<Label htmlFor="events" className="whitespace-nowrap">
							Events (0-50)
						</Label>
						<Input
							type="number"
							id="events"
							placeholder="Events"
							defaultValue={numberOfEvents}
							min={0}
							max={50}
							onChange={(e) => {
								e.target.value = clamp(e.target.valueAsNumber, 0, 50).toString();
								setNumberOfEvents(clamp(e.target.valueAsNumber, 0, 50));
							}}
						/>
					</div>
				</Setting>
				<Setting
					label={"Launches"}
					description={"Will the bot schedule an event for space launches?"}
					active={settings.se_launch}
					disabled={numberOfEvents === 0}
					disabledMessage={"You must enable at least 1 event to use this"}
				>
					<Switch
						id={"toggle-se-launch"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									se_launch: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								se_launch: checked,
							}));
						}}
						defaultChecked={settings.se_launch}
					/>
				</Setting>
				<Setting
					label={"Events"}
					description={"Will the bot schedule an event for space events?"}
					active={settings.se_event}
					disabled={numberOfEvents === 0}
					disabledMessage={"You must enable at least 1 event to use this"}
				>
					<Switch
						id={"toggle-se-event"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									se_event: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								se_event: checked,
							}));
						}}
						defaultChecked={settings.se_event}
					/>
				</Setting>
				<Setting
					label={"Hide Video-less Events"}
					description={"Will the bot hide events that do not have a video?"}
					active={settings.se_no_url}
					disabled={numberOfEvents === 0}
					disabledMessage={"You must enable at least 1 event to use this"}
				>
					<Switch
						id={"toggle-se-no-url"}
						onCheckedChange={(checked) => {
							updateSettings({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									se_no_url: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								se_no_url: checked,
							}));
						}}
						defaultChecked={settings.se_no_url}
					/>
				</Setting>
			</SettingGroup>
		</div>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
