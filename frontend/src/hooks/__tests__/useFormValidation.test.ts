import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFormValidation } from "../useFormValidation";

const testConfig = {
	name: {
		rules: [
			{ validate: (v: string) => v.length > 0, message: "Name is required" },
		],
	},
	email: {
		rules: [
			{
				validate: (v: string) => v.includes("@"),
				message: "Invalid email",
			},
		],
	},
};

describe("useFormValidation", () => {
	it("initializes fields with isValid=false and isTouched=false", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));
		expect(result.current.fields.name).toEqual({
			isValid: false,
			isTouched: false,
		});
		expect(result.current.fields.email).toEqual({
			isValid: false,
			isTouched: false,
		});
	});

	it("validateField returns true and marks valid for passing input", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validateField("name", "John");
		});
		expect(isValid!).toBe(true);
		expect(result.current.fields.name.isValid).toBe(true);
		expect(result.current.fields.name.isTouched).toBe(true);
	});

	it("validateField returns false and sets error for failing input", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validateField("name", "");
		});
		expect(isValid!).toBe(false);
		expect(result.current.fields.name.isValid).toBe(false);
		expect(result.current.fields.name.error).toBe("Name is required");
		expect(result.current.fields.name.isTouched).toBe(true);
	});

	it("validateField returns true for unknown field", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validateField("unknown", "anything");
		});
		expect(isValid!).toBe(true);
	});

	it("validateAll returns true when all fields pass", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validateAll({
				name: "John",
				email: "john@example.com",
			});
		});
		expect(isValid!).toBe(true);
	});

	it("validateAll returns false when any field fails", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		let isValid: boolean;
		act(() => {
			isValid = result.current.validateAll({
				name: "John",
				email: "invalid",
			});
		});
		expect(isValid!).toBe(false);
		expect(result.current.fields.email.isValid).toBe(false);
	});

	it("touchField marks field as touched", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		act(() => {
			result.current.touchField("name");
		});
		expect(result.current.fields.name.isTouched).toBe(true);
	});

	it("reset clears all field state", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		act(() => {
			result.current.validateField("name", "John");
			result.current.validateField("email", "test@test.com");
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.fields.name).toEqual({
			isValid: false,
			isTouched: false,
		});
		expect(result.current.fields.email).toEqual({
			isValid: false,
			isTouched: false,
		});
	});

	it("isFormValid is true when no fields are touched", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));
		expect(result.current.isFormValid).toBe(true);
	});

	it("isFormValid is true when all touched fields are valid", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		act(() => {
			result.current.validateField("name", "John");
			result.current.validateField("email", "john@test.com");
		});
		expect(result.current.isFormValid).toBe(true);
	});

	it("isFormValid is false when a touched field is invalid", () => {
		const { result } = renderHook(() => useFormValidation(testConfig));

		act(() => {
			result.current.validateField("name", "");
		});
		expect(result.current.isFormValid).toBe(false);
	});
});
