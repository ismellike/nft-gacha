"use client";

// Minimal type exports kept for backward compatibility after removing XState.
export interface AppraisalResult {
	collection: string;
	tokenId: string;
	appraisalData: readonly [boolean, bigint, bigint, string, bigint];
}

