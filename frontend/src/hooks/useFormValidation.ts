import { useState, useCallback } from "react";
import type { ValidationRule } from "../lib/formValidation";
import type { FieldValidation } from "../lib/formValidation";

interface FieldConfig {
	rules: ValidationRule[];
	validateOnChange?: boolean;
}

interface UseFormValidationReturn {
	fields: Record<string, FieldValidation>;
	validateField: (name: string, value: string) => boolean;
	validateAll: (data: Record<string, string>) => boolean;
	touchField: (name: string) => void;
	reset: () => void;
	isFormValid: boolean;
}

export function useFormValidation(
	config: Record<string, FieldConfig>,
): UseFormValidationReturn {
	const [fields, setFields] = useState<Record<string, FieldValidation>>(() =>
		Object.fromEntries(
			Object.keys(config).map((name) => [
				name,
				{ isValid: false, isTouched: false },
			]),
		),
	);

	const validateField = useCallback(
		(name: string, value: string): boolean => {
			const fieldConfig = config[name];
			if (!fieldConfig) return true;

			for (const rule of fieldConfig.rules) {
				if (!rule.validate(value)) {
					setFields((prev) => ({
						...prev,
						[name]: { isValid: false, error: rule.message, isTouched: true },
					}));
					return false;
				}
			}

			setFields((prev) => ({
				...prev,
				[name]: { isValid: true, isTouched: true },
			}));
			return true;
		},
		[config],
	);

	const validateAll = useCallback(
		(data: Record<string, string>): boolean => {
			let isValid = true;
			for (const [name, value] of Object.entries(data)) {
				if (!validateField(name, value)) {
					isValid = false;
				}
			}
			return isValid;
		},
		[validateField],
	);

	const touchField = useCallback((name: string) => {
		setFields((prev) => ({
			...prev,
			[name]: { ...prev[name], isTouched: true },
		}));
	}, []);

	const reset = useCallback(() => {
		setFields(
			Object.fromEntries(
				Object.keys(config).map((name) => [
					name,
					{ isValid: false, isTouched: false },
				]),
			),
		);
	}, [config]);

	const isFormValid = Object.values(fields).every(
		(f) => f.isValid || !f.isTouched,
	);

	return {
		fields,
		validateField,
		validateAll,
		touchField,
		reset,
		isFormValid,
	};
}
