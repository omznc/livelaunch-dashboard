"use client";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
	Credenza,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
} from "@components/ui/credenza";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@components/ui/select";
import { Setting, SettingGroup } from "@components/ui/setting";
import { Switch } from "@components/ui/switch";
import type { enabled_guilds, notification_countdown } from "@generated/client";
import { unwrap } from "@lib/action-result";
import type { RESTGetAPIGuildChannelsResult } from "discord-api-types/v10";
import { Hash, Megaphone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { addCountdown, disableFeature, removeCountdown, updateChannel, updateFilters } from "./actions";

interface ClientProps {
	guild: Pick<
		enabled_guilds,
		| "guild_id"
		| "notification_channel_id"
		| "notification_end_status"
		| "notification_deploy"
		| "notification_hold"
		| "notification_go"
		| "notification_liftoff"
		| "notification_tbc"
		| "notification_tbd"
		| "notification_t0_change"
		| "notification_launch"
		| "notification_event"
	>;
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
	const _router = useRouter();

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

	const [selectedChannelID, setSelectedChannelID] = useState<string | undefined>(
		guild.notification_channel_id?.toString(),
	);

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
	const [addingCountdown, setAddingCountdown] = useState(false);
	const totalMinutes = newCountdown.days * 24 * 60 + newCountdown.hours * 60 + newCountdown.minutes;

	// The dialog stays open on a failure, so the user can fix the input.
	const submitCountdown = async () => {
		setAddingCountdown(true);
		try {
			await unwrap(addCountdown({ guildId: String(guild.guild_id), settings: newCountdown }));
			toast.success("Countdown added.");
			setAddCountdownDialogOpen(false);
		} catch (error) {
			toast.error(error instanceof Error && error.message ? error.message : "Failed to add countdown.");
		} finally {
			setAddingCountdown(false);
		}
	};

	return (
		<div className="flex flex-col">
			<SettingGroup title={"Notifications"} description={"Settings for the notification feature."}>
				{guild.notification_channel_id !== null && (
					<Setting
						label={"Disable Feature"}
						description={"Disable this feature for your server."}
						active={false}
					>
						<Button
							onClick={() => {
								toast.promise(unwrap(disableFeature({ guildId: String(guild.guild_id) })), {
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
					label={"Notification Channel"}
					description={
						"Choose which channel the bot should send notifications to. Setting this enables this feature."
					}
					active={false}
				>
					<Select
						onValueChange={(value) => {
							setSelectedChannelID(value);
							toast.promise(
								unwrap(updateChannel({ guildId: String(guild.guild_id), channelId: value })),
								{
									loading: "Saving...",
									success: (r) => {
										if (!r.data?.success) throw new Error(r.serverError);
										return "Saved";
									},
									error: (e?: Error) => {
										setSelectedChannelID(undefined);
										return e ? e.message : "Failed to save.";
									},
								},
							);
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
												<Hash className="mr-2 inline-block h-[18px] w-[18px]" />
											) : (
												<Megaphone className="mr-2 inline-block h-[18px] w-[18px]" />
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
										<Hash className="mr-2 inline-block h-[18px] w-[18px]" />
									) : (
										<Megaphone className="mr-2 inline-block h-[18px] w-[18px]" />
									)}
									{channel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Setting>
				<Setting
					label={"Notification Countdown"}
					description={"Set how long before a launch the bot should send a notification."}
					active={false}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Credenza open={addCountdownDialogOpen} onOpenChange={setAddCountdownDialogOpen}>
						<Button
							onClick={() => {
								resetNewCountdown();
								setAddCountdownDialogOpen(true);
							}}
							className="w-fit whitespace-nowrap"
							variant="outline"
						>
							Add a Countdown
						</Button>
						<CredenzaContent>
							<CredenzaHeader>
								<CredenzaTitle>Add a Countdown</CredenzaTitle>
								<CredenzaDescription>
									{`Let's create a new countdown. You can add ${64 - countdowns.length} more.`}
								</CredenzaDescription>
							</CredenzaHeader>
							<div className="flex flex-col justify-center gap-4 sm:justify-start">
								<div className="flex items-center gap-2">
									<div className="grid max-w-sm items-center gap-1.5">
										<Label htmlFor="days">Days (0-31)</Label>
										<Input
											type="number"
											id="days"
											placeholder="Days"
											defaultValue={0}
											min={0}
											max={31}
											onChange={(e) => {
												const days = boundedValue(e.target, 31);
												setNewCountdown((prev) => ({ ...prev, days }));
											}}
										/>
									</div>
									<div className="grid max-w-sm items-center gap-1.5">
										<Label htmlFor="hours">Hours (0-24)</Label>
										<Input
											type="number"
											id="hours"
											placeholder="Hours"
											defaultValue={0}
											min={0}
											max={24}
											onChange={(e) => {
												const hours = boundedValue(e.target, 24);
												setNewCountdown((prev) => ({ ...prev, hours }));
											}}
										/>
									</div>
									<div className="grid max-w-sm items-center gap-1.5">
										<Label htmlFor="minutes">Minutes (0-60)</Label>
										<Input
											type="number"
											id="minutes"
											placeholder="Minutes"
											defaultValue={0}
											min={0}
											max={60}
											onChange={(e) => {
												const minutes = boundedValue(e.target, 60);
												setNewCountdown((prev) => ({ ...prev, minutes }));
											}}
										/>
									</div>
								</div>
								{`That would be ${totalMinutes} minutes beforehand.`}
							</div>
							<CredenzaFooter>
								<Button variant="outline" onClick={() => setAddCountdownDialogOpen(false)}>
									Cancel
								</Button>
								<Button disabled={totalMinutes === 0 || addingCountdown} onClick={submitCountdown}>
									Add
								</Button>
							</CredenzaFooter>
						</CredenzaContent>
					</Credenza>
				</Setting>
				<div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
					<h2 className="font-medium text-[15px]">
						{countdowns.length > 0
							? "Current Countdowns"
							: "This is where you'd see your countdowns, if you had any."}
					</h2>
					<div className="flex flex-wrap gap-2 empty:hidden">
						{countdowns.map((countdown) => (
							<Badge key={`${countdown.guild_id}-${countdown.minutes}`} className="gap-2 pr-1">
								{(() => {
									const days = Math.floor(countdown.minutes / 60 / 24);
									const hours = Math.floor(countdown.minutes / 60) % 24;
									const minutes = countdown.minutes % 60;

									return (
										<div className="flex items-center gap-1">
											{days > 0 && (
												<span>
													{days} day
													{days > 1 ? "s" : ""}
												</span>
											)}
											{hours > 0 && (
												<span>
													{hours} hour
													{hours > 1 ? "s" : ""}
												</span>
											)}
											{minutes > 0 && (
												<span>
													{minutes} minute
													{minutes > 1 ? "s" : ""}
												</span>
											)}
										</div>
									);
								})()}
								<button
									type="button"
									aria-label="Remove countdown"
									className="grid h-5 w-5 place-items-center text-fg2 hover:text-fg"
									onClick={() => {
										unwrap(
											removeCountdown({
												guildId: String(guild.guild_id),
												minutes: countdown.minutes,
											}),
										).catch((e: Error) => {
											toast.error(e.message || "Failed to remove countdown.");
										});
									}}
								>
									<X className="h-4 w-4" />
								</button>
							</Badge>
						))}
					</div>
				</div>
			</SettingGroup>

			<SettingGroup
				title={"General Filtering"}
				description={"Other filters that can be applied to notifications."}
			>
				<Setting
					label={"T-0 Change"}
					description={"Will the bot send a notification when the launch time changes?"}
					active={settings.notification_t0_change}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_t0_change: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_t0_change: checked,
							}));
						}}
						defaultChecked={settings.notification_t0_change}
					/>
				</Setting>

				<Setting
					label={"Launch"}
					description={"Will the bot send notifications for launches?"}
					active={settings.notification_launch}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_launch: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_launch: checked,
							}));
						}}
						defaultChecked={settings.notification_launch}
					/>
				</Setting>

				<Setting
					label={"Event"}
					description={"Will the bot send notifications for space events?"}
					active={settings.notification_event}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_event: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_event: checked,
							}));
						}}
						defaultChecked={settings.notification_event}
					/>
				</Setting>
			</SettingGroup>

			<SettingGroup
				title={"Status Filtering"}
				description={"Choose which launch statuses the bot should send notifications for."}
			>
				<Setting
					label={"End Status"}
					description={"Will the bot send a notification when the launch recieves an end status?"}
					active={settings.notification_end_status}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_end_status: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_end_status: checked,
							}));
						}}
						defaultChecked={settings.notification_end_status}
					/>
				</Setting>

				<Setting
					label={"Payload Deployed"}
					description={"Will the bot send a notification when the payload deploys?"}
					active={settings.notification_deploy}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_deploy: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_deploy: checked,
							}));
						}}
						defaultChecked={settings.notification_deploy}
					/>
				</Setting>

				<Setting
					label={"Hold"}
					description={"Will the bot send a notification when a hold occurs?"}
					active={settings.notification_hold}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_hold: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_hold: checked,
							}));
						}}
						defaultChecked={settings.notification_hold}
					/>
				</Setting>

				<Setting
					label={"Liftoff"}
					description={"Will the bot send a notification when the rocket lifts off?"}
					active={settings.notification_liftoff}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_liftoff: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_liftoff: checked,
							}));
						}}
						defaultChecked={settings.notification_liftoff}
					/>
				</Setting>

				<Setting
					label={"Go for Launch"}
					description={"Will the bot send a notification when the launch is go?"}
					active={settings.notification_go}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_go: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_go: checked,
							}));
						}}
						defaultChecked={settings.notification_go}
					/>
				</Setting>

				<Setting
					label={"To Be Confirmed"}
					description={"Will the bot send a notification when the launch is to be confirmed?"}
					active={settings.notification_tbc}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_tbc: checked,
								},
							});
							setSettings((prev) => ({
								...prev,
								notification_tbc: checked,
							}));
						}}
						defaultChecked={settings.notification_tbc}
					/>
				</Setting>

				<Setting
					label={"To Be Determined"}
					description={"Will the bot send a notification when the launch is to be determined?"}
					active={settings.notification_tbd}
					disabled={guild.notification_channel_id === null}
					disabledMessage={"Requires a notification channel to be set"}
				>
					<Switch
						onCheckedChange={(checked) => {
							updateFilters({
								guildId: String(guild.guild_id),
								settings: {
									...settings,
									notification_tbd: checked,
								},
							});
							setSettings((prev) => ({
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

// Clamps the field to 0..max and treats an empty field as 0.
function boundedValue(input: HTMLInputElement, max: number) {
	const raw = input.valueAsNumber;
	if (Number.isNaN(raw)) return 0;
	const value = clamp(raw, 0, max);
	if (value !== raw) input.value = String(value);
	return value;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
