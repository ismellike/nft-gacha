"use client";

import {
	CheckIcon,
	ExclamationTriangleIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import {
	useReadGachaPaused,
	useWriteGachaEmergencyPause,
	useWriteGachaEmergencyUnpause,
} from "@/generated";
import type { GachaConfig } from "@/lib/gacha-config";
import { Button, Card, Chip } from "../../../ui";

export function EmergencySection({ gacha }: { gacha: GachaConfig }) {
	const { data: isPaused } = useReadGachaPaused({
		address: gacha.address as `0x${string}`,
	});

	const { writeContract: pauseContract, isPending: isPausing } =
		useWriteGachaEmergencyPause();
	const { writeContract: unpauseContract, isPending: isUnpausing } =
		useWriteGachaEmergencyUnpause();

	const handlePause = () => {
		pauseContract({
			address: gacha.address as `0x${string}`,
		});
	};

	const handleUnpause = () => {
		unpauseContract({
			address: gacha.address as `0x${string}`,
		});
	};

	return (
		<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Emergency Controls
				</h2>
				<p className="text-foreground/70">
					Pause or unpause contract operations in case of emergency.
				</p>
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between p-6 bg-content1/10 border border-white/10 rounded-xl">
					<div>
						<h3 className="text-lg font-semibold text-foreground">
							Contract Status
						</h3>
						<p className="text-foreground/60">
							Current operational state of the gacha contract
						</p>
					</div>
					<Chip
						className={`px-3 py-1.5 rounded-xl backdrop-blur-xl ${isPaused ? "bg-danger/20 border border-danger/30 text-danger" : "bg-success/20 border border-success/30 text-success"}`}
					>
						{isPaused ? (
							<XCircleIcon className="w-4 h-4" />
						) : (
							<CheckIcon className="w-4 h-4" />
						)}
						<span className="ml-2">{isPaused ? "PAUSED" : "ACTIVE"}</span>
					</Chip>
				</div>

				<div className="flex gap-4">
					{!isPaused ? (
						<Button
							className="flex-1 rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
							onPress={handlePause}
							isLoading={isPausing}
						>
							<span className="inline-flex items-center gap-2">
								<XCircleIcon className="w-4 h-4" />
								Pause Contract
							</span>
						</Button>
					) : (
						<Button
							color="glassPrimary"
							onPress={handleUnpause}
							isLoading={isUnpausing}
						>
							<span className="inline-flex items-center gap-2">
								<CheckIcon className="w-4 h-4" />
								Unpause Contract
							</span>
						</Button>
					)}
				</div>

				<div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
					<div className="flex items-start gap-3">
						<ExclamationTriangleIcon className="w-5 h-5 text-warning mt-0.5" />
						<div>
							<h4 className="font-semibold text-warning mb-1">
								Emergency Use Only
							</h4>
							<p className="text-warning/80 text-sm">
								Pausing the contract will stop all spinning operations. Only use
								in case of security issues or critical bugs. Users will not be
								able to spin until unpaused.
							</p>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
