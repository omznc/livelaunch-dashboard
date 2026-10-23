// next-safe-action resolves with serverError or validationErrors. It does not reject.
// Call unwrap so that a failed action rejects, and toast.promise shows its error state.
interface ActionResult {
	serverError?: string;
	validationErrors?: unknown;
}

export async function unwrap<T extends ActionResult | undefined>(promise: Promise<T>): Promise<T> {
	const result = await promise;
	if (result?.serverError) throw new Error(result.serverError);
	if (result?.validationErrors) throw new Error("The input is not valid.");
	return result;
}
