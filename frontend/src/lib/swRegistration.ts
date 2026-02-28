/**
 * Service Worker Registration Utility
 * Registers and manages the PWA service worker
 */

const SW_URL = "/sw.js";

interface ServiceWorkerRegisterResult {
	success: boolean;
	error?: string;
}

export async function registerSW(): Promise<ServiceWorkerRegisterResult> {
	if (typeof window === "undefined") {
		return { success: false, error: "Not in browser environment" };
	}

	if (!("serviceWorker" in navigator)) {
		console.warn("[SW] Service Worker not supported in this browser");
		return { success: false, error: "Service Worker not supported" };
	}

	// Check if we're on localhost or HTTPS
	if (
		location.protocol !== "https:" &&
		location.hostname !== "localhost" &&
		location.hostname !== "127.0.0.1"
	) {
		console.warn("[SW] Service Worker only works on HTTPS or localhost");
		return { success: false, error: "Requires HTTPS or localhost" };
	}

	try {
		const registration = await navigator.serviceWorker.register(SW_URL);
		console.log("[SW] Registered successfully:", registration.scope);

		// Check for updates
		registration.addEventListener("updatefound", () => {
			const newWorker = registration.installing;
			if (newWorker) {
				newWorker.addEventListener("statechange", () => {
					if (
						newWorker.state === "installed" &&
						navigator.serviceWorker.controller
					) {
						// New service worker is available
						console.log("[SW] New content is available; please refresh.");
						// You could show a notification to the user here
						window.dispatchEvent(new CustomEvent("swUpdateAvailable"));
					}
				});
			}
		});

		// Handle controller change (new SW took control)
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			console.log("[SW] Controller changed, reloading page");
			window.location.reload();
		});

		return { success: true };
	} catch (error) {
		console.error("[SW] Registration failed:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
