"use client";

import { useCallback } from "react";
import { useClientSearchParam, useUpdateSearchParams } from "./useClientSearchParams";

/**
 * Hook to sync form data with URL search parameters
 * Provides two-way synchronization between form state and URL
 * @param initialFormData - Initial form data
 * @returns [formData, setFormDataWithUrlSync] tuple
 */
export function useFormUrlSync(initialFormData: { collection: string; tokenId: string }) {
	const collectionParam = useClientSearchParam("collection");
	const tokenIdParam = useClientSearchParam("tokenId");
	const updateSearchParams = useUpdateSearchParams();

	// Get form data from URL params or use initial values
	const urlSyncedFormData = {
		collection: collectionParam || initialFormData.collection,
		tokenId: tokenIdParam || initialFormData.tokenId,
	};

	// Update URL params when form data changes
	const updateUrlFromFormData = useCallback(
		(newFormData: { collection: string; tokenId: string }) => {
			const urlUpdates: Record<string, string | null> = {};

			// Only update URL if values are non-empty
			if (newFormData.collection.trim()) {
				urlUpdates.collection = newFormData.collection.trim();
			} else {
				urlUpdates.collection = null; // Remove from URL if empty
			}

			if (newFormData.tokenId.trim()) {
				urlUpdates.tokenId = newFormData.tokenId.trim();
			} else {
				urlUpdates.tokenId = null; // Remove from URL if empty
			}

			// Update URL without causing page reload
			updateSearchParams(urlUpdates);
		},
		[updateSearchParams],
	);

	return [urlSyncedFormData, updateUrlFromFormData] as const;
}