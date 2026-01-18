/**
 * Service Worker Registration Utility
 * Registers and manages the PWA service worker
 */

const SW_URL = "/sw.js";

export interface ServiceWorkerRegisterResult {
	success: boolean;
	error?: string;
}

export function registerSW(): ServiceWorkerRegisterResult {
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

	navigator.serviceWorker
		.register(SW_URL)
		.then((registration) => {
			console.log("[SW] Registered successfully:", registration.scope);

			// Check for updates
			registration.addEventListener("updatefound", () => {
				const newWorker = registration.installing;
				if (newWorker) {
					newWorker.addEventListener("statechange", () => {
						if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
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
		})
		.catch((error) => {
			console.error("[SW] Registration failed:", error);
			return { success: false, error: error.message };
		});

	return { success: true };
}

export function unregisterSW(): Promise<boolean> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return Promise.resolve(false);
	}

	return navigator.serviceWorker
		.getRegistration()
		.then((registration) => {
			if (registration) {
				return registration
					.unregister()
					.then((success) => {
						console.log("[SW] Unregistered successfully");
						return success;
					})
					.catch((error) => {
						console.error("[SW] Unregistration failed:", error);
						return false;
					});
			}
			return false;
		})
		.catch((error) => {
			console.error("[SW] Failed to get registration:", error);
			return false;
		});
}

export async function getSWRegistration(): Promise<
	ServiceWorkerRegistration | null
> {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.getRegistration();
		return registration ?? null;
	} catch (error) {
		console.error("[SW] Failed to get registration:", error);
		return null;
	}
}

export async function requestSWUpdate(): Promise<void> {
	const registration = await getSWRegistration();
	if (registration && registration.waiting) {
		// Tell the waiting service worker to skip waiting
		registration.waiting.postMessage({ type: "SKIP_WAITING" });
	}
}

export async function clearSWCache(): Promise<void> {
	const registration = await getSWRegistration();
	if (registration && registration.active) {
		registration.active.postMessage({ type: "CLEAR_CACHE" });
	}
}
