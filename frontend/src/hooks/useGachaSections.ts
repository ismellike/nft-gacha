"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
 * Keeps URL, document title, and access restrictions in sync with local state.
 */
export function useGachaSections({
	isOwner,
	gachaTitle,
	defaultSection = "spin",
	shouldGateAdmin = true,
}: UseGachaSectionsOptions) {
	const sectionParam = useClientSearchParam("section");
	const updateSearchParams = useUpdateSearchParams();

	const sectionFromParam = useMemo<GachaSection>(() => {
		if (sectionParam && VALID_SECTIONS.includes(sectionParam as GachaSection)) {
			return sectionParam as GachaSection;
		}
		return defaultSection;
	}, [sectionParam, defaultSection]);

	const [activeSection, setActiveSection] =
		useState<GachaSection>(sectionFromParam);

	// Keep internal state in sync with the URL (e.g. browser back button)
	useEffect(() => {
		if (activeSection !== sectionFromParam) {
			setActiveSection(sectionFromParam);
		}
	}, [activeSection, sectionFromParam]);

	// Enforce access control and push sanitized section to the URL
	useEffect(() => {
		const shouldRedirectFromAdmin =
			activeSection === "admin" && shouldGateAdmin && !isOwner;
		const next = shouldRedirectFromAdmin ? defaultSection : activeSection;
		updateSearchParams({ section: next });
		if (next !== activeSection) {
			setActiveSection(next);
		}
	}, [
		activeSection,
		defaultSection,
		isOwner,
		shouldGateAdmin,
		updateSearchParams,
	]);

	// Keep document title aligned with the current section for better UX/SEO
	useEffect(() => {
		if (!gachaTitle) return;
		const sectionLabel = SECTION_TITLES[activeSection];
		document.title = `${gachaTitle} - ${sectionLabel} | Spin-Fi`;
	}, [activeSection, gachaTitle]);

	const selectSection = useCallback(
		(next: GachaSection) => {
			const allowed =
				next === "admin" && shouldGateAdmin && !isOwner
					? (defaultSection as GachaSection)
					: next;
			setActiveSection(allowed);
			updateSearchParams({ section: allowed });
		},
		[defaultSection, isOwner, shouldGateAdmin, updateSearchParams],
	);

	return {
		activeSection,
		selectSection,
		isAdminLocked: activeSection === "admin" && !isOwner,
	};
}
