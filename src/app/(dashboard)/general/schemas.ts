import { z } from "zod";

// Unknown keys in `settings` are stripped. The action never writes channel_id or guild_id from this input.
export const generalSettingsSchema = z.object({
	guildId: z.string(),
	settings: z.object({
		notification_button_fc: z.boolean().optional(),
		notification_button_g4l: z.boolean().optional(),
		notification_button_sln: z.boolean().optional(),
		se_launch: z.boolean().optional(),
		se_event: z.boolean().optional(),
		se_no_url: z.boolean().optional(),
	}),
});
