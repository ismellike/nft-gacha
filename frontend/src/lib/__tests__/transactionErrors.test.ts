import { describe, it, expect } from "vitest";
import { mapTransactionError } from "../transactionErrors";

describe("mapTransactionError", () => {
	it("detects user rejected (message)", () => {
		const result = mapTransactionError({ message: "User rejected request" });
		expect(result.title).toBe("Transaction Cancelled");
		expect(result.canRetry).toBe(true);
	});

	it("detects user denied", () => {
		const result = mapTransactionError({ message: "Request denied by user" });
		expect(result.title).toBe("Transaction Cancelled");
	});

	it("detects user cancelled", () => {
		const result = mapTransactionError({
			message: "Transaction was cancelled",
		});
		expect(result.title).toBe("Transaction Cancelled");
	});

	it("detects error code 4001", () => {
		const result = mapTransactionError({ message: "", code: 4001 });
		expect(result.title).toBe("Transaction Cancelled");
		expect(result.canRetry).toBe(true);
	});

	it("detects insufficient funds", () => {
		const result = mapTransactionError({
			message: "insufficient funds for gas",
		});
		expect(result.title).toBe("Insufficient Funds");
		expect(result.canRetry).toBe(false);
	});

	it("detects exceeds balance", () => {
		const result = mapTransactionError({
			message: "exceeds balance",
		});
		expect(result.title).toBe("Insufficient Funds");
		expect(result.canRetry).toBe(false);
	});

	it("detects fee mismatch", () => {
		const result = mapTransactionError({ message: "maxFee too low" });
		expect(result.title).toBe("Price Updated");
		expect(result.canRetry).toBe(true);
	});

	it("detects revert spin", () => {
		const result = mapTransactionError({ message: "revert in spin call" });
		expect(result.title).toBe("Price Updated");
	});

	it("detects invalid signature", () => {
		const result = mapTransactionError({ message: "invalid signature" });
		expect(result.title).toBe("Signature Error");
		expect(result.canRetry).toBe(true);
	});

	it("detects permit error", () => {
		const result = mapTransactionError({ message: "permit expired" });
		expect(result.title).toBe("Signature Error");
	});

	it("detects network error", () => {
		const result = mapTransactionError({ message: "network error" });
		expect(result.title).toBe("Network Error");
		expect(result.canRetry).toBe(true);
	});

	it("detects timeout", () => {
		const result = mapTransactionError({ message: "request timeout" });
		expect(result.title).toBe("Network Error");
	});

	it("detects rpc error", () => {
		const result = mapTransactionError({ message: "rpc connection failed" });
		expect(result.title).toBe("Network Error");
	});

	it("returns fallback for unknown error", () => {
		const result = mapTransactionError({
			message: "something completely unknown",
		});
		expect(result.title).toBe("Transaction Failed");
		expect(result.canRetry).toBe(true);
	});
});
