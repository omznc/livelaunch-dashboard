// next-safe-action resolves with serverError or validationErrors. It does not reject.
// An action can also return { error } in data for an expected failure.
// Call unwrap so that a failed action rejects with a non-empty message, and toast.promise shows it.
interface ActionResult {
	serverError?: string;
	validationErrors?: unknown;
	data?: unknown;
}

export const FALLBACK_ERROR = "Failed to save.";

function dataError(data: unknown): string | undefined {
	if (typeof data !== "object" || data === null || !("error" in data)) return undefined;
	return typeof data.error === "string" && data.error ? data.error : undefined;
}

export async function unwrap<T extends ActionResult | undefined>(promise: Promise<T>): Promise<T> {
	const result = await promise;
	if (result?.serverError) throw new Error(result.serverError);
	const error = dataError(result?.data);
	if (error) throw new Error(error);
	if (result?.validationErrors) throw new Error("The input is not valid.");
	return result;
}

// The message for a toast. It is never empty.
export function errorMessage(error: unknown, fallback = FALLBACK_ERROR): string {
	return error instanceof Error && error.message ? error.message : fallback;
}
