"use client";

import { useEffect } from "react";

import { registerSW } from "../../lib/swRegistration";

export function ServiceWorkerRegistrar() {
	useEffect(() => {
		// Register service worker
		const result = registerSW();
		if (!result.success) {
			console.warn("[SW] Service worker registration failed:", result.error);
		}

		// Handle service worker updates
		const handleSWUpdate = () => {
			console.log("[SW] New version available");
			// You could show a toast notification here
		};

		window.addEventListener("swUpdateAvailable", handleSWUpdate);
		return () => {
			window.removeEventListener("swUpdateAvailable", handleSWUpdate);
		};
	}, []);

	return null;
}
