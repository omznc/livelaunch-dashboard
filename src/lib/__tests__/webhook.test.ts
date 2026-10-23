import { describe, expect, mock, test } from "bun:test";
import { createReplaceWebhook, parseWebhookId } from "../webhook";

const ID = "123456789012345678";

describe("parseWebhookId", () => {
	test("returns the ID of a valid URL", () => {
		expect(parseWebhookId(`https://discord.com/api/webhooks/${ID}/token`)).toBe(ID);
	});

	test("returns null for a bad URL", () => {
		expect(parseWebhookId("not a url")).toBeNull();
		expect(parseWebhookId("https://discord.com/api/channels/123")).toBeNull();
		expect(parseWebhookId("https://discord.com/api/webhooks/abc/token")).toBeNull();
	});
});

describe("replaceWebhook", () => {
	test("saves first, then deletes the old webhook", async () => {
		const calls: string[] = [];
		const remove = mock(async (url: string) => {
			calls.push(`delete ${url}`);
			return true;
		});
		await createReplaceWebhook(remove)("new", "old", async () => {
			calls.push("save");
		});
		expect(calls).toEqual(["save", "delete old"]);
	});

	test("deletes the new webhook and throws again when the save fails", async () => {
		const remove = mock(async (_url: string) => true);
		const replace = createReplaceWebhook(remove);
		await expect(
			replace("new", "old", async () => {
				throw new Error("db down");
			}),
		).rejects.toThrow("db down");
		expect(remove.mock.calls).toEqual([["new"]]);
	});
});
