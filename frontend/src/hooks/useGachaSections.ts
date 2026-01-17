"use client";

import { useEffect, useMemo } from "react";
import {
	useClientSearchParam,
	useUpdateSearchParams,
} from "./useClientSearchParams";

export type GachaSection = "spin" | "vault" | "economy" | "history" | "admin";

const VALID_SECTIONS: GachaSection[] = ["spin", "vault", "economy", "history", "admin"];

const SECTION_TITLES: Record<GachaSection, string> = {
	spin: "Spin & Play",
	vault: "My Vault & Profile",
	economy: "Economy Overview",
	history: "Spin History",
	admin: "Admin Controls",
};

interface UseGachaSectionsOptions {
	isOwner: boolean;
	gachaTitle?: string | null;
	defaultSection?: Exclude<GachaSection, "admin">;
	shouldGateAdmin?: boolean;
}

/**
 * Centralized controller for the gacha page sections.
 * Derives state from URL params to avoid sync issues.
 */
export function useGachaSections({
	isOwner,
	gachaTitle,
	defaultSection = "spin",
	shouldGateAdmin = true,
}: UseGachaSectionsOptions) {
	const sectionParam = useClientSearchParam("section");
	const updateSearchParams = useUpdateSearchParams();

	// Derive active section from URL param with validation
	const rawSection = useMemo<GachaSection>(() => {
		if (sectionParam && VALID_SECTIONS.includes(sectionParam as GachaSection)) {
			return sectionParam as GachaSection;
		}
		return defaultSection;
	}, [sectionParam, defaultSection]);

	// Enforce access control - derive the actual section to display
	const activeSection = useMemo<GachaSection>(() => {
		const shouldRedirectFromAdmin =
			rawSection === "admin" && shouldGateAdmin && !isOwner;
		return shouldRedirectFromAdmin ? defaultSection : rawSection;
	}, [rawSection, isOwner, defaultSection, shouldGateAdmin]);

	// Keep document title aligned with the current section for better UX/SEO
	useEffect(() => {
		if (!gachaTitle) return;
		const sectionLabel = SECTION_TITLES[activeSection];
		document.title = `${gachaTitle} - ${sectionLabel} | Spin-Fi`;
	}, [activeSection, gachaTitle]);

	// Update URL when user selects a section
	const selectSection = (next: GachaSection) => {
		// Just update the URL - state will be derived from it
		updateSearchParams({ section: next });
	};

	return {
		activeSection,
		selectSection,
		isAdminLocked: activeSection === "admin" && !isOwner,
	};
}
