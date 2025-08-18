"use client";

import {
	isCourtyardTokenURI,
	fetchCourtyardMetadata,
	processCourtyardImageUrl,
} from "./courtyard-utils";

/**
 * Debug utility for Courtyard NFT issues
 */
export class CourtyardDebugger {
	static async diagnoseNFT(
		collection: string,
		tokenId: string,
		tokenURI?: string,
	) {
		console.group(`🏺 Courtyard NFT Diagnosis: ${collection}/${tokenId}`);

		const diagnosis = {
			collection,
			tokenId,
			tokenURI: tokenURI || "Not provided",
			isCourtyardDetected: false,
			metadataFetchResult: null as any,
			imageUrlResult: null as string | null,
			possibleIssues: [] as string[],
			recommendations: [] as string[],
		};

		try {
			// Check if it's a Courtyard URL
			if (tokenURI) {
				diagnosis.isCourtyardDetected = isCourtyardTokenURI(tokenURI);
				console.log("🔍 Courtyard Detection:", diagnosis.isCourtyardDetected);

				if (!diagnosis.isCourtyardDetected) {
					diagnosis.possibleIssues.push(
						"TokenURI does not match Courtyard API pattern",
					);
					diagnosis.recommendations.push(
						"Verify this is actually a Courtyard NFT",
					);
				} else {
					console.log("✅ Courtyard NFT detected");

					// Try to fetch metadata
					try {
						console.log("📡 Fetching Courtyard metadata...");
						const metadata = await fetchCourtyardMetadata(tokenURI);
						diagnosis.metadataFetchResult = metadata;

						if (metadata) {
							console.log("✅ Metadata fetched successfully:", {
								name: metadata.name,
								description: metadata.description?.substring(0, 100),
								hasImage: !!metadata.image,
								imageUrl: metadata.image,
								hasAttributes: !!metadata.attributes?.length,
								attributeCount: metadata.attributes?.length || 0,
							});

							// Test image URL processing
							const processedImageUrl = processCourtyardImageUrl(metadata);
							diagnosis.imageUrlResult = processedImageUrl;

							if (processedImageUrl) {
								console.log("✅ Image URL processed:", processedImageUrl);

								// Test image accessibility
								try {
									const testResponse = await fetch(processedImageUrl, {
										method: "HEAD",
										mode: "cors",
										signal: AbortSignal.timeout(5000),
									});

									if (testResponse.ok) {
										console.log("✅ Image URL is accessible");
									} else {
										console.warn(
											"⚠️ Image URL returned:",
											testResponse.status,
											testResponse.statusText,
										);
										diagnosis.possibleIssues.push(
											`Image URL returned HTTP ${testResponse.status}`,
										);
										diagnosis.recommendations.push(
											"Image might have CORS restrictions or be temporarily unavailable",
										);
									}
								} catch (imageError) {
									console.warn(
										"❌ Image accessibility test failed:",
										imageError,
									);
									diagnosis.possibleIssues.push(
										"Image URL is not accessible (CORS or network issue)",
									);
									diagnosis.recommendations.push(
										"Try using image proxy or check CORS policies",
									);
								}
							} else {
								console.warn("❌ No valid image URL found in metadata");
								diagnosis.possibleIssues.push(
									"No valid image URL found in Courtyard metadata",
								);
								diagnosis.recommendations.push(
									"Check if metadata structure matches expected format",
								);
							}
						} else {
							console.error("❌ Metadata fetch returned null");
							diagnosis.possibleIssues.push("Metadata fetch returned null");
							diagnosis.recommendations.push(
								"Check network connectivity and Courtyard API status",
							);
						}
					} catch (metadataError) {
						console.error("❌ Metadata fetch failed:", metadataError);
						diagnosis.metadataFetchResult = { error: metadataError };
						diagnosis.possibleIssues.push(
							`Metadata fetch failed: ${(metadataError as Error).message}`,
						);

						if ((metadataError as Error).message.includes("404")) {
							diagnosis.recommendations.push(
								"TokenURI might be invalid or NFT might not exist",
							);
						} else if ((metadataError as Error).message.includes("timeout")) {
							diagnosis.recommendations.push(
								"Courtyard API is slow - try increasing timeout",
							);
						} else {
							diagnosis.recommendations.push(
								"Check Courtyard API status and network connectivity",
							);
						}
					}
				}
			} else {
				diagnosis.possibleIssues.push("No tokenURI provided");
				diagnosis.recommendations.push(
					"Ensure NFT contract returns valid tokenURI",
				);
			}

			// Summary
			console.log("\n📋 Diagnosis Summary:");
			console.log("Issues found:", diagnosis.possibleIssues.length);
			diagnosis.possibleIssues.forEach((issue, i) =>
				console.log(`  ${i + 1}. ${issue}`),
			);

			console.log("Recommendations:", diagnosis.recommendations.length);
			diagnosis.recommendations.forEach((rec, i) =>
				console.log(`  ${i + 1}. ${rec}`),
			);
		} catch (error) {
			console.error("❌ Diagnosis failed:", error);
			diagnosis.possibleIssues.push(
				`Diagnosis failed: ${(error as Error).message}`,
			);
		}

		console.groupEnd();
		return diagnosis;
	}

	/**
	 * Test multiple Courtyard URLs for debugging
	 */
	static async testBatchUrls(urls: string[]) {
		console.group("🧪 Batch Courtyard URL Testing");

		const results = [];

		for (let i = 0; i < urls.length; i++) {
			const url = urls[i];
			console.log(`\n📋 Testing URL ${i + 1}/${urls.length}: ${url}`);

			try {
				const metadata = await fetchCourtyardMetadata(url);
				const imageUrl = metadata ? processCourtyardImageUrl(metadata) : null;

				results.push({
					url,
					success: !!metadata,
					metadata,
					imageUrl,
					error: null,
				});

				console.log(`✅ Success:`, {
					hasMetadata: !!metadata,
					hasImage: !!imageUrl,
					name: metadata?.name,
				});
			} catch (error) {
				results.push({
					url,
					success: false,
					metadata: null,
					imageUrl: null,
					error: (error as Error).message,
				});

				console.log(`❌ Failed:`, (error as Error).message);
			}
		}

		console.log("\n📊 Batch Test Summary:");
		const successCount = results.filter((r) => r.success).length;
		console.log(
			`Success rate: ${successCount}/${urls.length} (${Math.round((successCount / urls.length) * 100)}%)`,
		);

		console.groupEnd();
		return results;
	}
}

// Expose debugger globally for console debugging
if (typeof window !== "undefined") {
	(window as any).CourtyardDebugger = CourtyardDebugger;
}
