// Visually hidden but accessible to screen readers
export function srOnly() {
	return "sr-only absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-normal border-0";
}

// Focus visible utility for better keyboard navigation
export function focusRing() {
	return "focus:outline-none focus-visible:outline-2 focus-visible:outline-warning focus-visible:outline-offset-2";
}

// Generate unique IDs for ARIA associations
let idCounter = 0;
export function generateId(prefix = "a11y") {
	return `${prefix}-${++idCounter}`;
}

// Announce messages to screen readers
export function announceToScreenReader(message: string) {
	if (typeof window === "undefined") return;

	const announcement = document.createElement("div");
	announcement.setAttribute("role", "status");
	announcement.setAttribute("aria-live", "polite");
	announcement.className = srOnly();
	announcement.textContent = message;

	document.body.appendChild(announcement);
	setTimeout(() => {
		if (document.body.contains(announcement)) {
			document.body.removeChild(announcement);
		}
	}, 1000);
}

// Announce assertive messages (interrupts current speech)
export function announceAssertive(message: string) {
	if (typeof window === "undefined") return;

	const announcement = document.createElement("div");
	announcement.setAttribute("role", "alert");
	announcement.setAttribute("aria-live", "assertive");
	announcement.className = srOnly();
	announcement.textContent = message;

	document.body.appendChild(announcement);
	setTimeout(() => {
		if (document.body.contains(announcement)) {
			document.body.removeChild(announcement);
		}
	}, 1000);
}
