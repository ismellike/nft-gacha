"use client";

import { useState, useEffect } from "react";
import { useGachaServiceHandler } from "../hooks/useGachaServiceHandler";
import { useGachaId } from "../hooks/useGachaId";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

/**
 * Component to display WAVS service handler information
 * Shows randomness proofs, envelope status, and service manager details
 */
export function WAVSServiceInfo() {
	const gachaId = useGachaId();
	const [envelopeHistory, setEnvelopeHistory] = useState<
		Array<{
			timestamp: number;
			status: "pending" | "success" | "failed";
			txHash?: string;
		}>
	>([]);

	const {
		serviceHandlerAddress,
		gacha,
		treasury,
		serviceManager,
		isServiceHandlerAvailable,
	} = useGachaServiceHandler(gachaId);

	// Mock envelope history - in real implementation this would come from events or API
	useEffect(() => {
		if (isServiceHandlerAvailable) {
			// TODO: Fetch actual envelope history from events or storage
			setEnvelopeHistory([
				{
					timestamp: Date.now() - 10000,
					status: "success",
					txHash: "0x1234...5678",
				},
			]);
		}
	}, [isServiceHandlerAvailable]);

	if (!isServiceHandlerAvailable) {
		return (
			<Card className="p-6 bg-red-500/10 border-red-500/20">
				<div className="flex items-center gap-3">
					<Badge color="danger" variant="solid">
						Service Unavailable
					</Badge>
					<p className="text-sm text-red-400">
						WAVS Service Handler not available for gacha {gachaId}
					</p>
				</div>
			</Card>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success":
				return "bg-green-500/10 border-green-500/20 text-green-400";
			case "pending":
				return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
			case "failed":
				return "bg-red-500/10 border-red-500/20 text-red-400";
			default:
				return "bg-gray-500/10 border-gray-500/20 text-gray-400";
		}
	};

	return (
		<div className="space-y-6">
			{/* Service Handler Status */}
			<Card className="p-6 bg-blue-500/10 border-blue-500/20">
				<h3 className="text-lg font-semibold text-blue-400 mb-4">
					WAVS Service Handler Status
				</h3>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-400">Service Handler:</span>
						<code className="text-xs bg-black/30 px-2 py-1 rounded">
							{serviceHandlerAddress?.slice(0, 8)}...
							{serviceHandlerAddress?.slice(-6)}
						</code>
					</div>

					{serviceManager && (
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-400">Service Manager:</span>
							<code className="text-xs bg-black/30 px-2 py-1 rounded">
								{serviceManager.slice(0, 8)}...{serviceManager.slice(-6)}
							</code>
						</div>
					)}

					{gacha && (
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-400">Gacha Contract:</span>
							<code className="text-xs bg-black/30 px-2 py-1 rounded">
								{gacha.slice(0, 8)}...{gacha.slice(-6)}
							</code>
						</div>
					)}

					{treasury && (
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-400">Treasury Contract:</span>
							<code className="text-xs bg-black/30 px-2 py-1 rounded">
								{treasury.slice(0, 8)}...{treasury.slice(-6)}
							</code>
						</div>
					)}
				</div>
			</Card>

			{/* Envelope History */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold text-white mb-4">
					Envelope History
				</h3>

				{envelopeHistory.length === 0 ? (
					<p className="text-sm text-gray-500">No envelope submissions yet</p>
				) : (
					<div className="space-y-3">
						{envelopeHistory.map((envelope, index) => (
							<div
								key={`${envelope.timestamp}-${index}`}
								className={`p-3 rounded-lg border ${getStatusColor(
									envelope.status,
								)}`}
							>
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<Badge variant="flat" className="text-xs">
											{envelope.status.toUpperCase()}
										</Badge>
										<span className="text-xs">
											{new Date(envelope.timestamp).toLocaleTimeString()}
										</span>
									</div>
									{envelope.txHash && (
										<code className="text-xs bg-black/30 px-2 py-1 rounded">
											{envelope.txHash}
										</code>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Randomness Info */}
			<Card className="p-6 bg-purple-500/10 border-purple-500/20">
				<h3 className="text-lg font-semibold text-purple-400 mb-4">
					Randomness Information
				</h3>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-400">Randomness Source:</span>
						<Badge variant="flat">WAVS-DRAND</Badge>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-400">Proof Verification:</span>
						<Badge variant="flat">Available</Badge>
					</div>

					<div className="text-xs text-gray-500 mt-4">
						<p>
							Randomness is generated using WAVS-DRAND infrastructure with
							provably fair randomness. All randomness proofs are verifiable
							on-chain.
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
