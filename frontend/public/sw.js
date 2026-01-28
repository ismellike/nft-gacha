/// <reference types="@types/serviceworker" />

const CACHE_VERSION = "v1";
const CACHE_NAME = `spinfi-pwa-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
	"/",
	"/manifest.webmanifest",
	"/android-chrome-192x192.png",
	"/android-chrome-512x512.png",
	"/apple-touch-icon.png",
	"/favicon.ico",
	"/favicon.svg",
];

// Runtime cache configuration
const RUNTIME_CACHE_ROUTES = [
	// Cache static assets (images, fonts, etc.)
	{
		urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/,
		handler: "CacheFirst",
		options: {
			cacheName: "static-assets",
			expiration: {
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
			},
		},
	},
	// Cache API calls with NetworkFirst strategy
	{
		urlPattern: /^https:\/\/.*\/api\/.*/,
		handler: "NetworkFirst",
		options: {
			cacheName: "api-cache",
			networkTimeoutSeconds: 10,
			expiration: {
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 24, // 24 hours
			},
		},
	},
	// Cache contract calls with StaleWhileRevalidate
	{
		urlPattern: /^https:\/\/.*\/rpc.*/,
		handler: "StaleWhileRevalidate",
		options: {
			cacheName: "rpc-cache",
			expiration: {
				maxEntries: 20,
				maxAgeSeconds: 60 * 5, // 5 minutes
			},
		},
	},
];

// Install event - precache assets
self.addEventListener("install", (event) => {
	console.log("[SW] Install event triggered");
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			console.log("[SW] Precaching assets", PRECACHE_ASSETS);
			await cache.addAll(PRECACHE_ASSETS);
			// Force activation
			await self.skipWaiting();
		})(),
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("[SW] Activate event triggered");
	event.waitUntil(
		(async () => {
			// Delete old caches
			const cacheNames = await caches.keys();
			const cachesToDelete = cacheNames.filter(
				(name) => name !== CACHE_NAME && name.startsWith("spinfi-pwa-"),
			);
			await Promise.all(cachesToDelete.map((name) => caches.delete(name)));
			// Take control of all clients immediately
			await self.clients.claim();
		})(),
	);
});

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== "GET") {
		return;
	}

	// Skip cross-origin requests
	if (url.origin !== self.location.origin) {
		// Handle third-party requests with runtime cache
		for (const route of RUNTIME_CACHE_ROUTES) {
			if (
				route.urlPattern instanceof RegExp &&
				route.urlPattern.test(url.href)
			) {
				event.respondWith(
					handleCacheStrategy(request, route.handler, route.options),
				);
				return;
			}
		}
		return;
	}

	// Handle same-origin requests
	event.respondWith(handleSameOriginRequest(request));
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
	const _url = new URL(request.url);

	// Try to serve from cache first, fall back to network
	const cachedResponse = await caches.match(request, {
		cacheName: CACHE_NAME,
		ignoreSearch: true,
	});

	if (cachedResponse) {
		// Return cached response and update cache in background
		fetchAndCache(request);
		return cachedResponse;
	}

	// If not in cache, fetch from network
	try {
		const networkResponse = await fetch(request);
		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.error("[SW] Network request failed, trying cache:", error);
		// Try to serve from cache (even if stale)
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		// Return offline fallback for HTML pages
		if (request.headers.get("accept")?.includes("text/html")) {
			return caches.match("/");
		}
		// Return error for other requests
		return new Response("Network error", { status: 503 });
	}
}

// Fetch and update cache in background
async function fetchAndCache(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
	} catch (error) {
		console.warn("[SW] Background fetch failed:", error);
	}
}

// Handle different caching strategies
async function handleCacheStrategy(request, strategy, options = {}) {
	const cache = await caches.open(options.cacheName || "runtime-cache");

	switch (strategy) {
		case "CacheFirst": {
			const cachedResponse = await cache.match(request);
			if (cachedResponse) {
				return cachedResponse;
			}
			const networkResponse = await fetch(request);
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			return networkResponse;
		}

		case "NetworkFirst": {
			try {
				const networkPromise = fetch(request);
				const timeoutPromise = new Promise((_, reject) =>
					setTimeout(
						() => reject(new Error("Network timeout")),
						(options.networkTimeoutSeconds || 10) * 1000,
					),
				);
				const networkResponse = await Promise.race([
					networkPromise,
					timeoutPromise,
				]);
				if (networkResponse instanceof Response) {
					cache.put(request, networkResponse.clone());
					return networkResponse;
				}
			} catch (error) {
				console.log("[SW] Network failed, serving from cache:", error);
			}
			// Fall back to cache
			const cachedResponse = await cache.match(request);
			if (cachedResponse) {
				return cachedResponse;
			}
			return fetch(request); // Last resort
		}

		case "StaleWhileRevalidate": {
			const cachedResponse = await cache.match(request);
			const fetchPromise = fetch(request).then((networkResponse) => {
				if (networkResponse.ok) {
					cache.put(request, networkResponse.clone());
				}
				return networkResponse;
			});
			return cachedResponse || fetchPromise;
		}

		default:
			return fetch(request);
	}
}

// Message event - handle messages from clients
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
	if (event.data && event.data.type === "CLEAR_CACHE") {
		caches.delete(CACHE_NAME);
	}
});

// Push notification (optional, for future implementation)
self.addEventListener("push", (event) => {
	if (!event.data) {
		return;
	}

	const options = {
		body: event.data.text(),
		icon: "/android-chrome-192x192.png",
		badge: "/android-chrome-192x192.png",
		vibrate: [200, 100, 200],
		tag: "spinfi-notification",
	};

	event.waitUntil(self.registration.showNotification("SPINFI", options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(self.clients.openWindow?.(event.notification.data || "/"));
});

console.log("[SW] Service Worker loaded");
