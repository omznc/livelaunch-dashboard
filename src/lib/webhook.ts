// Pure webhook helpers. They have no server imports, so a test can load them.

export const SNOWFLAKE = /^\d{17,20}$/;

// Webhook URL shape: https://discord.com/api/webhooks/{id}/{token}
export const parseWebhookId = (url: string): string | null => {
	try {
		const parts = new URL(url).pathname.split("/").filter(Boolean);
		const index = parts.indexOf("webhooks");
		const id = index === -1 ? undefined : parts[index + 1];
		return id && SNOWFLAKE.test(id) ? id : null;
	} catch {
		return null;
	}
};

/**
 * Makes a function that saves the new webhook, then deletes the old one.
 * If the save fails, it deletes the new webhook and throws the error again.
 * If the old webhook cannot be deleted, the new webhook stays.
 */
export const createReplaceWebhook =
	(remove: (url: string) => Promise<boolean>) =>
	async (newUrl: string, oldUrl: string | null | undefined, save: () => Promise<unknown>) => {
		try {
			await save();
		} catch (error) {
			await remove(newUrl);
			throw error;
		}
		if (oldUrl) await remove(oldUrl);
	};
