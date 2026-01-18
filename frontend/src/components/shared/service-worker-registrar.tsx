"use client";

import { useEffect } from "react";

import { registerSW } from "../../lib/swRegistration";

export function ServiceWorkerRegistrar() {
	useEffect(() => {
		// Track if component is mounted
		let isMounted = true;

		// Register service worker
		const handleSWUpdate = () => {
			if (isMounted) {
				console.log("[SW] New version available");
				// You could show a toast notification here
			}
		};

		// Add event listener before registration
		window.addEventListener("swUpdateAvailable", handleSWUpdate);

		// Register service worker
		registerSW().then((result) => {
			if (isMounted && !result.success) {
				console.warn("[SW] Service worker registration failed:", result.error);
			}
		});

		// Cleanup function
		return () => {
			isMounted = false;
			window.removeEventListener("swUpdateAvailable", handleSWUpdate);
		};
	}, []);

	return null;
}
