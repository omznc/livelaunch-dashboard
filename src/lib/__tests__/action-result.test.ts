import { describe, expect, test } from "bun:test";
import { errorMessage, unwrap } from "../action-result";

describe("unwrap", () => {
	test("throws the serverError message", async () => {
		await expect(unwrap(Promise.resolve({ serverError: "Server broke" }))).rejects.toThrow("Server broke");
	});

	test("throws a message for validationErrors", async () => {
		await expect(unwrap(Promise.resolve({ validationErrors: { _errors: ["bad"] } }))).rejects.toThrow(
			"The input is not valid.",
		);
	});

	test("throws data.error", async () => {
		await expect(unwrap(Promise.resolve({ data: { error: "Could not create a webhook." } }))).rejects.toThrow(
			"Could not create a webhook.",
		);
	});

	test("returns a successful result", async () => {
		const result = { data: { success: true } };
		expect(await unwrap(Promise.resolve(result))).toBe(result);
	});
});

describe("errorMessage", () => {
	test("is never empty", () => {
		expect(errorMessage(new Error(""))).not.toBe("");
		expect(errorMessage("text")).not.toBe("");
	});
});
