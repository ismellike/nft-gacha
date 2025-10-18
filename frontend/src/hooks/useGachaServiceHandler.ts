"use client";

import { useGachaContracts } from "./useGachaContracts";
import {
	useReadGachaServiceHandlerGetGacha,
	useReadGachaServiceHandlerGetGachaTreasury,
	useReadGachaServiceHandlerGetServiceManager,
	useWriteGachaServiceHandlerHandleSignedEnvelope,
	useWatchGachaServiceHandlerRandomnessReceived,
} from "../generated";

/**
 * Hook to interact with the GachaServiceHandler contract
 * Provides access to WAVS randomness functionality
 */
export function useGachaServiceHandler(gachaId: string) {
	const contracts = useGachaContracts(gachaId);
	const serviceHandlerAddress = contracts.gachaServiceHandler;

	// Read contract data
	const { data: gacha } = useReadGachaServiceHandlerGetGacha({
		address: serviceHandlerAddress as `0x${string}` | undefined,
	});

	const { data: treasury } = useReadGachaServiceHandlerGetGachaTreasury({
		address: serviceHandlerAddress as `0x${string}` | undefined,
	});

	const { data: serviceManager } = useReadGachaServiceHandlerGetServiceManager({
		address: serviceHandlerAddress as `0x${string}` | undefined,
	});

	// Write contract operations
	const {
		writeContract: handleSignedEnvelope,
		isPending: isHandlingEnvelope,
		error: handleEnvelopeError
	} = useWriteGachaServiceHandlerHandleSignedEnvelope();

	// Watch for randomness events
	useWatchGachaServiceHandlerRandomnessReceived({
		address: serviceHandlerAddress as `0x${string}` | undefined,
		onLogs: (logs) => {
			console.log("Randomness received:", logs);
			// Handle randomness received events
		},
	});

	return {
		// Contract address
		serviceHandlerAddress,

		// Read data
		gacha,
		treasury,
		serviceManager,

		// Write operations
		handleSignedEnvelope,
		isHandlingEnvelope,
		handleEnvelopeError,

		// Check if service handler is available
		isServiceHandlerAvailable: !!serviceHandlerAddress,
	};
}

/**
 * Hook to retry handleSignedEnvelope calls
 * Useful for handling failed WAVS envelope submissions
 */
export function useRetrySignedEnvelope(gachaId: string) {
	const { handleSignedEnvelope, isHandlingEnvelope, handleEnvelopeError } = useGachaServiceHandler(gachaId);

	const retryEnvelope = async (envelopeData: any) => {
		try {
			await handleSignedEnvelope({
				address: envelopeData.address,
				args: envelopeData.args,
			});
		} catch (error) {
			console.error("Failed to retry signed envelope:", error);
			throw error;
		}
	};

	return {
		retryEnvelope,
		isHandlingEnvelope,
		handleEnvelopeError,
	};
}