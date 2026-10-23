import { z } from "zod";

// Unknown keys in `settings` are stripped. The action never writes channel_id or guild_id from this input.
export const notificationsFilterSchema = z.object({
	guildId: z.string(),
	settings: z.object({
		notification_end_status: z.boolean().optional(),
		notification_deploy: z.boolean().optional(),
		notification_hold: z.boolean().optional(),
		notification_go: z.boolean().optional(),
		notification_liftoff: z.boolean().optional(),
		notification_tbc: z.boolean().optional(),
		notification_tbd: z.boolean().optional(),
		notification_t0_change: z.boolean().optional(),
		notification_launch: z.boolean().optional(),
		notification_event: z.boolean().optional(),
	}),
});
