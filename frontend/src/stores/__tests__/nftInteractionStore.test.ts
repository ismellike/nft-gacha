import { describe, it, expect, beforeEach } from "vitest";
import { useNFTInteractionStore } from "../nftInteractionStore";

const mockPublicClient = {} as any;

const startConfig = {
	collection: "0xCollection",
	tokenId: "1",
	mode: "deposit" as const,
	treasuryAddress: "0xTreasury",
	userAddress: "0xUser",
	publicClient: mockPublicClient,
	payoutAmount: 1000n,
};

describe("nftInteractionStore", () => {
	beforeEach(() => {
		useNFTInteractionStore.setState({
			interactions: {},
			activeInteraction: null,
		});
	});

	describe("startInteraction", () => {
		it("creates interaction with checkingApprovals status", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active).not.toBeNull();
			expect(active?.status).toBe("checkingApprovals");
			expect(active?.context?.collection).toBe("0xCollection");
			expect(active?.context?.tokenId).toBe("1");
		});

		it("sets activeInteraction key", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			expect(useNFTInteractionStore.getState().activeInteraction).toBe(
				"deposit:0xCollection:1:default",
			);
		});
	});

	describe("setStatus", () => {
		it("changes status of active interaction", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);

			useNFTInteractionStore
				.getState()
				.setStatus("awaitingNFTApprovalSignature");

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active?.status).toBe("awaitingNFTApprovalSignature");
		});

		it("does nothing when no active interaction", () => {
			const store = useNFTInteractionStore.getState();
			store.setStatus("error"); // no-op
			expect(store.getActiveInteraction()).toBeNull();
		});
	});

	describe("markApprovalSubmitted", () => {
		it("sets status and stores txHash", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore.getState().markApprovalSubmitted("0xTxHash");

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active?.status).toBe("awaitingNFTApprovalReceipt");
			expect(active?.context?.nftApprovalTxHash).toBe("0xTxHash");
		});
	});

	describe("markApprovalReceipt", () => {
		it("sets status to awaitingInteractionSignature", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore.getState().markApprovalReceipt("0xTx");

			expect(
				useNFTInteractionStore.getState().getActiveInteraction()?.status,
			).toBe("awaitingInteractionSignature");
		});
	});

	describe("markInteractionSubmitted", () => {
		it("sets status and stores txHash", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore
				.getState()
				.markInteractionSubmitted("0xInteractionTx");

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active?.status).toBe("awaitingInteractionReceipt");
			expect(active?.context?.interactionTxHash).toBe("0xInteractionTx");
		});
	});

	describe("markInteractionSuccess", () => {
		it("sets status to completed and creates success object", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore.getState().markInteractionSuccess("0xSuccessTx");

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active?.status).toBe("completed");
			expect(active?.context?.success).toBeDefined();
			expect(active?.context?.success?.txHash).toBe("0xSuccessTx");
			expect(active?.context?.success?.payoutAmount).toBe(1000n);
		});
	});

	describe("setError", () => {
		it("sets status to error and stores message", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore.getState().setError("Something failed");

			const active = useNFTInteractionStore.getState().getActiveInteraction();
			expect(active?.status).toBe("error");
			expect(active?.context?.error).toBe("Something failed");
		});
	});

	describe("resetInteraction", () => {
		it("removes active interaction from map", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);
			useNFTInteractionStore.getState().resetInteraction();

			expect(
				useNFTInteractionStore.getState().getActiveInteraction(),
			).toBeNull();
			expect(useNFTInteractionStore.getState().activeInteraction).toBeNull();
		});
	});

	describe("getInteraction", () => {
		it("retrieves specific interaction by key", () => {
			const store = useNFTInteractionStore.getState();
			store.startInteraction(startConfig);

			const interaction = useNFTInteractionStore
				.getState()
				.getInteraction("deposit", "0xCollection", "1");
			expect(interaction).not.toBeNull();
			expect(interaction?.status).toBe("checkingApprovals");
		});

		it("returns null for non-existent interaction", () => {
			expect(
				useNFTInteractionStore
					.getState()
					.getInteraction("deposit", "0xNope", "99"),
			).toBeNull();
		});
	});
});
