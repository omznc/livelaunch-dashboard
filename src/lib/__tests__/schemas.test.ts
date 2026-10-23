import { expect, test } from "bun:test";
import { generalSettingsSchema } from "../../app/(dashboard)/general/schemas";
import { notificationsFilterSchema } from "../../app/(dashboard)/notifications/schemas";

const extra = { channel_id: "1", guild_id: "2", webhook_url: "x" };

test("the general schema strips unknown keys", () => {
	const parsed = generalSettingsSchema.parse({ guildId: "1", settings: { se_launch: true, ...extra } });
	expect(parsed.settings).toEqual({ se_launch: true });
});

test("the notifications schema strips unknown keys", () => {
	const parsed = notificationsFilterSchema.parse({ guildId: "1", settings: { notification_go: false, ...extra } });
	expect(parsed.settings).toEqual({ notification_go: false });
});
