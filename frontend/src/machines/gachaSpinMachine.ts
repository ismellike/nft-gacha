"use client";

import type { PublicClient } from "viem";
import { assign, fromPromise, setup } from "xstate";
import type { RefundResult, SpinResult } from "../async-utils/gachaSpinMachine";
import { pollForSpinFulfillment } from "../async-utils/gachaSpinMachine";

export const MAX_RETRIES = 5;

export interface GachaSpinContext {
	triggerId: bigint | null;
	spinResult: SpinResult | null;
	refundResult: RefundResult | null;
	userAddress: string | null;
	publicClient: PublicClient | undefined;
	gachaAddress: string | null;
	error: string | null;
	retryCount: number;
}

export type GachaSpinEvent =
	| {
			type: "START_SPIN";
			userAddress: string;
			publicClient: PublicClient;
			gachaAddress: string;
	  }
	| { type: "CONFIRM_TRANSACTION"; triggerId: bigint }
	| { type: "FULFILL_SPIN"; result: SpinResult }
	| { type: "CLOSE_REVEAL" }
	| {
			type: "RETRY";
			userAddress?: string | undefined;
			publicClient?: PublicClient | undefined;
			gachaAddress?: string | undefined;
	  }
	| { type: "RESET" }
	| { type: "TIMEOUT" }
	| { type: "SET_ERROR"; error: string }
	| { type: "CLEAR_PENDING_SPINS" };

const pollForFulfillment = fromPromise<
	| { type: "completed"; result: SpinResult }
	| { type: "refunded"; refundResult: RefundResult },
	{
		triggerId: bigint;
		userAddress: string;
		publicClient: PublicClient;
		gachaAddress: string;
	}
>(({ input, signal }) =>
	pollForSpinFulfillment({
		triggerId: input.triggerId,
		userAddress: input.userAddress,
		publicClient: input.publicClient,
		gachaAddress: input.gachaAddress,
		signal,
	}),
);

export const gachaSpinMachine = setup({
	types: {
		context: {} as GachaSpinContext,
		events: {} as GachaSpinEvent,
	},
	actors: {
		pollForFulfillment,
	},
	guards: {
		canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		hasSpinContext: ({ event }) => {
			const e = event as Extract<GachaSpinEvent, { type: "START_SPIN" }>;
			return !!e.userAddress && !!e.publicClient && !!e.gachaAddress;
		},
	},
	actions: {
		clearSpinResult: assign({
			spinResult: null,
			refundResult: null,
			error: null,
		}),
		clearAll: assign({
			triggerId: null,
			spinResult: null,
			refundResult: null,
			error: null,
			retryCount: 0,
		}),
	},
}).createMachine({
	id: "gachaSpin",
	initial: "idle",
	context: {
		triggerId: null,
		spinResult: null,
		refundResult: null,
		userAddress: null,
		publicClient: undefined,
		gachaAddress: null,
		error: null,
		retryCount: 0,
	},
	on: {
		RESET: {
			target: ".idle",
			actions: "clearAll",
		},
		SET_ERROR: {
			target: ".error",
			actions: assign({
				error: ({ event }) => event.error,
			}),
		},
		CLEAR_PENDING_SPINS: {
			target: ".idle",
			actions: "clearAll",
		},
	},
	states: {
		idle: {
			on: {
				START_SPIN: {
					target: "spinning",
					guard: "hasSpinContext",
					actions: assign({
						userAddress: ({ event }) => event.userAddress,
						publicClient: ({ event }) => event.publicClient,
						gachaAddress: ({ event }) => event.gachaAddress,
						error: null,
						retryCount: 0,
						spinResult: null,
						refundResult: null,
						triggerId: null,
					}),
				},
			},
		},
		spinning: {
			on: {
				CONFIRM_TRANSACTION: {
					target: "waitingForFulfillment",
					actions: assign({
						triggerId: ({ event }) => event.triggerId,
						retryCount: 0,
					}),
				},
				FULFILL_SPIN: {
					target: "revealing",
					actions: assign({
						spinResult: ({ event }) => event.result,
						refundResult: null,
						error: null,
					}),
				},
			},
		},
		waitingForFulfillment: {
			invoke: {
				id: "pollForFulfillment",
				src: "pollForFulfillment",
				input: ({ context }) => ({
					triggerId: context.triggerId as bigint,
					userAddress: context.userAddress as string,
					publicClient: context.publicClient as PublicClient,
					gachaAddress: context.gachaAddress as string,
				}),
				onDone: [
					{
						target: "revealing",
						guard: ({ event }) => event.output.type === "completed",
						actions: assign({
							spinResult: ({ event }) => {
								if (event.output.type === "completed") {
									return event.output.result;
								}
								return null;
							},
							refundResult: null,
							error: null,
						}),
					},
					{
						target: "refunded",
						actions: assign({
							refundResult: ({ event }) => {
								if (event.output.type === "refunded") {
									return event.output.refundResult;
								}
								return null;
							},
							error: null,
						}),
					},
				],
				onError: {
					target: "error",
					actions: assign({
						error: ({ event }) =>
							event.error instanceof Error
								? event.error.message
								: "Polling failed",
					}),
				},
			},
			on: {
				FULFILL_SPIN: {
					target: "revealing",
					actions: assign({
						spinResult: ({ event }) => event.result,
						refundResult: null,
						error: null,
					}),
				},
				TIMEOUT: {
					target: "timeout",
					actions: assign({
						error:
							"Randomness generation timed out. You can reclaim your funds or try again.",
					}),
				},
			},
		},
		revealing: {
			on: {
				CLOSE_REVEAL: {
					target: "idle",
					actions: assign({
						spinResult: null,
						triggerId: null,
					}),
				},
			},
		},
		error: {
			on: {
				RETRY: {
					target: "waitingForFulfillment",
					guard: "canRetry",
					actions: assign({
						retryCount: ({ context }) => context.retryCount + 1,
						error: null,
						userAddress: ({ context, event }) =>
							event.userAddress ?? context.userAddress,
						publicClient: ({ context, event }) =>
							event.publicClient ?? context.publicClient,
						gachaAddress: ({ context, event }) =>
							event.gachaAddress ?? context.gachaAddress,
					}),
				},
				START_SPIN: {
					target: "spinning",
					guard: "hasSpinContext",
					actions: assign({
						userAddress: ({ event }) => event.userAddress,
						publicClient: ({ event }) => event.publicClient,
						gachaAddress: ({ event }) => event.gachaAddress,
						error: null,
						retryCount: 0,
						spinResult: null,
						refundResult: null,
						triggerId: null,
					}),
				},
			},
		},
		timeout: {
			on: {
				START_SPIN: {
					target: "spinning",
					guard: "hasSpinContext",
					actions: assign({
						userAddress: ({ event }) => event.userAddress,
						publicClient: ({ event }) => event.publicClient,
						gachaAddress: ({ event }) => event.gachaAddress,
						error: null,
						retryCount: 0,
						spinResult: null,
						refundResult: null,
						triggerId: null,
					}),
				},
			},
		},
		refunded: {
			on: {
				START_SPIN: {
					target: "spinning",
					guard: "hasSpinContext",
					actions: assign({
						userAddress: ({ event }) => event.userAddress,
						publicClient: ({ event }) => event.publicClient,
						gachaAddress: ({ event }) => event.gachaAddress,
						error: null,
						retryCount: 0,
						spinResult: null,
						refundResult: null,
						triggerId: null,
					}),
				},
			},
		},
	},
});
