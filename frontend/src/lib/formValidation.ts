export interface ValidationRule {
	validate: (value: string) => boolean;
	message: string;
}

export interface FieldValidation {
	isValid: boolean;
	error?: string;
	isTouched: boolean;
}

export interface UseFormValidationReturn {
	fields: Record<string, FieldValidation>;
	validateField: (name: string, value: string) => boolean;
	validateAll: (data: Record<string, string>) => boolean;
	touchField: (name: string) => void;
	reset: () => void;
	isFormValid: boolean;
}

// Validation rules library
export const validationRules = {
	required: (message = "This field is required"): ValidationRule => ({
		validate: (value) => value.trim().length > 0,
		message,
	}),

	ethAddress: (message = "Please enter a valid Ethereum address"): ValidationRule => ({
		validate: (value) => /^0x[a-fA-F0-9]{40}$/.test(value),
		message,
	}),

	tokenId: (message = "Please enter a valid token ID"): ValidationRule => ({
		validate: (value) => {
			const num = Number(value);
			return !Number.isNaN(num) && num >= 0 && Number.isInteger(num);
		},
		message,
	}),

	minLength: (min: number, message?: string): ValidationRule => ({
		validate: (value) => value.length >= min,
		message: message || `Must be at least ${min} characters`,
	}),

	maxLength: (max: number, message?: string): ValidationRule => ({
		validate: (value) => value.length <= max,
		message: message || `Must be no more than ${max} characters`,
	}),

	min: (min: number, message?: string): ValidationRule => ({
		validate: (value) => {
			const num = Number(value);
			return !Number.isNaN(num) && num >= min;
		},
		message: message || `Must be at least ${min}`,
	}),

	max: (max: number, message?: string): ValidationRule => ({
		validate: (value) => {
			const num = Number(value);
			return !Number.isNaN(num) && num <= max;
		},
		message: message || `Must be no more than ${max}`,
	}),

	pattern: (regex: RegExp, message = "Invalid format"): ValidationRule => ({
		validate: (value) => regex.test(value),
		message,
	}),
};
