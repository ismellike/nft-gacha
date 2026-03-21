import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastConfig {
	title?: string;
	message: string;
	type?: ToastType;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

function showToast({
	title,
	message,
	type = "info",
	duration = 4000,
	action,
}: ToastConfig) {
	const options = {
		description: message,
		duration,
		action: action
			? { label: action.label, onClick: action.onClick }
			: undefined,
	};

	const label = title ?? message;

	switch (type) {
		case "success":
			return toast.success(label, options);
		case "error":
			return toast.error(label, options);
		case "warning":
			return toast.warning(label, options);
		case "info":
			return toast.info(label, options);
	}
}

// Convenience functions
export const toastSuccess = (message: string, title?: string) =>
	showToast({ message, ...(title && { title }), type: "success" });

export const toastError = (message: string, title?: string) =>
	showToast({
		message,
		...(title && { title }),
		type: "error",
		duration: 6000,
	});

export const toastInfo = (message: string, title?: string) =>
	showToast({ message, ...(title && { title }), type: "info" });
