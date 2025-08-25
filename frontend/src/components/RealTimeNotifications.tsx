"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
	useWatchGachaSpinCompleted,
	useWatchGachaTreasuryNftDeposited,
	useWatchErc721Transfer,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { Rarity, getRarityConfig, rarityFromNumber } from "../lib/rarityConfig";
import { formatTokenId, formatAddress } from "../lib/utils";
import {
	BellIcon,
	SparklesIcon,
	GiftIcon,
	TrophyIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

interface Notification {
	id: string;
	type: "spin_completed" | "nft_deposited" | "nft_won";
	title: string;
	message: string;
	rarity?: Rarity;
	timestamp: number;
	txHash?: string;
	autoClose?: boolean;
}

interface ToastNotification extends Notification {
	isVisible: boolean;
}

export const RealTimeNotifications: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
	const [isEnabled, setIsEnabled] = useState(true);

	const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp">) => {
		const newNotification: Notification = {
			...notification,
			id: `${Date.now()}-${Math.random()}`,
			timestamp: Date.now(),
		};

		setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep latest 10

		// Show floating toast notification
		if (isEnabled) {
			const toastNotification: ToastNotification = {
				...newNotification,
				isVisible: true,
			};
			
			setToastNotifications(prev => [...prev, toastNotification]);

			// Auto-dismiss toast after 5 seconds
			setTimeout(() => {
				setToastNotifications(prev => 
					prev.map(t => t.id === toastNotification.id ? { ...t, isVisible: false } : t)
				);
			}, 5000);

			// Remove from toasts array after animation completes
			setTimeout(() => {
				setToastNotifications(prev => prev.filter(t => t.id !== toastNotification.id));
			}, 5500);
		}

		// Auto-remove after delay
		if (notification.autoClose !== false) {
			setTimeout(() => {
				setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
			}, 10000);
		}
	}, [isEnabled]);

	// Watch for spin completion events
	useWatchGachaSpinCompleted({
		address: contracts.gacha!,
		enabled: !!contracts.gacha && isEnabled,
		onLogs: useCallback((logs: any[]) => {
			logs.forEach((log: any) => {
				try {
					const { args } = log;
					if (!args) return;

					const [spinner, triggerId, collection, tokenId, rarity] = args as [
						`0x${string}`,
						bigint,
						`0x${string}`,
						bigint,
						number
					];

					const rarityEnum = rarityFromNumber(rarity);
					const config = getRarityConfig(rarityEnum);
					const isUserSpin = spinner.toLowerCase() === userAddress?.toLowerCase();

					addNotification({
						type: "spin_completed",
						title: isUserSpin ? "🎉 Spin Completed!" : "🎰 Someone Won!",
						message: isUserSpin 
							? `You won a ${config.name} NFT: ${formatTokenId(tokenId.toString())}`
							: `${formatAddress(spinner)} won a ${config.name} NFT!`,
						rarity: rarityEnum,
						txHash: log.transactionHash,
						autoClose: !isUserSpin, // Keep user's own spins longer
					});
				} catch (error) {
					console.error("Error parsing spin completed event:", error);
				}
			});
		}, [userAddress, addNotification]),
	});

	// Watch for NFT deposits
	useWatchGachaTreasuryNftDeposited({
		address: contracts.treasury!,
		enabled: !!contracts.treasury && isEnabled,
		onLogs: useCallback((logs: any[]) => {
			logs.forEach((log: any) => {
				try {
					const { args } = log;
					if (!args) return;

					const [collection, tokenId, depositor, rarity] = args as [
						`0x${string}`,
						bigint,
						`0x${string}`,
						number
					];

					const rarityEnum = rarityFromNumber(rarity);
					const config = getRarityConfig(rarityEnum);
					const isUserDeposit = depositor.toLowerCase() === userAddress?.toLowerCase();

					addNotification({
						type: "nft_deposited",
						title: isUserDeposit ? "✨ NFT Deposited!" : "🎁 New NFT Available!",
						message: isUserDeposit
							? `Your ${config.name} NFT has been deposited successfully`
							: `New ${config.name} NFT available for gacha!`,
						rarity: rarityEnum,
						txHash: log.transactionHash,
						autoClose: !isUserDeposit,
					});
				} catch (error) {
					console.error("Error parsing NFT deposited event:", error);
				}
			});
		}, [userAddress, addNotification]),
	});

	const removeNotification = (id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id));
	};

	const clearAllNotifications = () => {
		setNotifications([]);
	};

	const toggleNotifications = () => {
		setIsEnabled(!isEnabled);
		// Show a simple feedback through the notification system itself
		if (!isEnabled) {
			// Will be enabled after this function
			addNotification({
				type: "nft_deposited",
				title: "🔔 Notifications Enabled",
				message: "You'll now receive real-time updates",
				autoClose: true,
			});
		}
	};

	return (
		<>
			{/* Notifications Toggle Button */}
			<motion.button
				onClick={toggleNotifications}
				className={`fixed top-20 right-4 z-50 p-3 rounded-full backdrop-blur-xl border shadow-lg transition-all duration-300 ${
					isEnabled 
						? "bg-content2/80 border-success/50 text-success hover:bg-success/10"
						: "bg-content2/80 border-foreground/20 text-foreground/50 hover:bg-content2/90"
				}`}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<BellIcon className={`w-5 h-5 ${!isEnabled && "opacity-50"}`} />
				{notifications.length > 0 && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-xs font-bold text-white"
					>
						{notifications.length > 9 ? "9+" : notifications.length}
					</motion.div>
				)}
			</motion.button>

			{/* Notifications Panel */}
			<AnimatePresence>
				{notifications.length > 0 && isEnabled && (
					<motion.div
						initial={{ opacity: 0, x: 400 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 400 }}
						className="fixed top-32 right-4 z-40 w-80 max-h-96 overflow-hidden"
					>
						<div className="bg-content1/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-white/10">
								<div className="flex items-center gap-2">
									<BellIcon className="w-5 h-5 text-success" />
									<span className="font-medium text-sm">Recent Activity</span>
								</div>
								<button
									onClick={clearAllNotifications}
									className="text-xs text-foreground/60 hover:text-foreground/80 transition-colors"
								>
									Clear all
								</button>
							</div>

							{/* Notifications List */}
							<div className="max-h-80 overflow-y-auto">
								<AnimatePresence>
									{notifications.map((notification) => (
										<motion.div
											key={notification.id}
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="border-b border-white/5 last:border-b-0"
										>
											<NotificationItem
												notification={notification}
												onRemove={() => removeNotification(notification.id)}
											/>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Toast Notifications */}
			<div className="fixed bottom-4 right-4 z-50 space-y-2">
				<AnimatePresence>
					{toastNotifications.map((toast) => (
						<ToastNotificationItem
							key={toast.id}
							notification={toast}
							onRemove={() => setToastNotifications(prev => prev.filter(t => t.id !== toast.id))}
						/>
					))}
				</AnimatePresence>
			</div>
		</>
	);
};

const NotificationItem: React.FC<{
	notification: Notification;
	onRemove: () => void;
}> = ({ notification, onRemove }) => {
	const config = notification.rarity ? getRarityConfig(notification.rarity) : null;
	const timeAgo = formatTimeAgo(notification.timestamp);

	const getIcon = () => {
		switch (notification.type) {
			case "spin_completed":
				return <SparklesIcon className="w-5 h-5" />;
			case "nft_deposited":
				return <GiftIcon className="w-5 h-5" />;
			case "nft_won":
				return <TrophyIcon className="w-5 h-5" />;
			default:
				return <BellIcon className="w-5 h-5" />;
		}
	};

	return (
		<div className="p-4 hover:bg-white/5 transition-colors group">
			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className={`p-2 rounded-lg ${config ? `bg-gradient-to-br ${config.bgGradient}/20` : "bg-content2/50"}`}>
					<div className={config ? config.textColor : "text-foreground/70"}>
						{getIcon()}
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className={`font-medium text-sm ${config?.textColor || "text-foreground"}`}>
						{notification.title}
					</div>
					<div className="text-xs text-foreground/70 mt-1 leading-relaxed">
						{notification.message}
					</div>
					<div className="flex items-center justify-between mt-2">
						<span className="text-xs text-foreground/50">{timeAgo}</span>
						{notification.txHash && (
							<button
								onClick={() => window.open(`https://etherscan.io/tx/${notification.txHash}`, '_blank')}
								className="text-xs text-info hover:text-info/80 transition-colors"
							>
								View tx →
							</button>
						)}
					</div>
				</div>

				{/* Close button */}
				<button
					onClick={onRemove}
					className="opacity-0 group-hover:opacity-100 text-foreground/50 hover:text-foreground/80 transition-all"
				>
					<XMarkIcon className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};

const ToastNotificationItem: React.FC<{
	notification: ToastNotification;
	onRemove: () => void;
}> = ({ notification, onRemove }) => {
	const config = notification.rarity ? getRarityConfig(notification.rarity) : null;
	const icon = notification.rarity ? config?.emoji : "🎉";

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.3 }}
			animate={{ 
				opacity: notification.isVisible ? 1 : 0, 
				y: notification.isVisible ? 0 : 50, 
				scale: notification.isVisible ? 1 : 0.3 
			}}
			exit={{ opacity: 0, y: -50, scale: 0.5 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={`bg-content2/90 backdrop-blur-xl border ${config?.borderColor || "border-white/20"} rounded-xl p-4 shadow-xl max-w-sm`}
		>
			<div className="flex items-start gap-3">
				<div className="text-2xl">{icon}</div>
				<div className="flex-1 min-w-0">
					<div className={`font-bold text-sm ${config?.textColor || "text-foreground"}`}>
						{notification.title}
					</div>
					<div className="text-xs text-foreground/70 mt-1">
						{notification.message}
					</div>
				</div>
				<button
					onClick={onRemove}
					className="text-foreground/50 hover:text-foreground/80 transition-colors"
				>
					<XMarkIcon className="w-4 h-4" />
				</button>
			</div>
		</motion.div>
	);
};

const formatTimeAgo = (timestamp: number): string => {
	const now = Date.now();
	const diff = now - timestamp;
	
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "Just now";
};