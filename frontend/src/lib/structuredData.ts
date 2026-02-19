export function generateOrganizationStructuredData() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "SPINFI",
		description: "Provably fair NFT gacha platform powered by WAVS-DRAND",
		url: "https://spinfi.com",
		logo: "https://spinfi.com/logo.webp",
		sameAs: [] as string[],
	};
}

export function generateWebsiteStructuredData() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "SPINFI",
		url: "https://spinfi.com",
		description:
			"Provably fair NFT gacha platform with cryptographically guaranteed randomness",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: "https://spinfi.com/search?q={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};
}
