"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnimation } from "framer-motion";
import type { NFTCardData } from "../components/NFTCard";

// Advanced interaction types
export type NFTInteractionType =
	| "hover"
	| "click"
	| "doubleClick"
	| "rightClick"
	| "longPress"
	| "swipeLeft"
	| "swipeRight"
	| "swipeUp"
	| "swipeDown"
	| "pinchZoom"
	| "select"
	| "favorite";

export interface NFTInteraction {
	type: NFTInteractionType;
	data: NFTCardData;
	timestamp: number;
	position?: { x: number; y: number } | undefined;
	metadata?: Record<string, unknown> | undefined;
}

export interface UseNFTInteractionsOptions {
	// Interaction enables
	enableHover?: boolean;
	enableClick?: boolean;
	enableDoubleClick?: boolean;
	enableRightClick?: boolean;
	enableLongPress?: boolean;
	enableSwipe?: boolean;
	enableSelect?: boolean;
	enableFavorite?: boolean;

	// Timing
	longPressDelay?: number;
	doubleClickDelay?: number;
	swipeThreshold?: number;

	// Callbacks
	onInteraction?: (interaction: NFTInteraction) => void;
	onHoverStart?: (data: NFTCardData) => void;
	onHoverEnd?: (data: NFTCardData) => void;
	onClick?: (data: NFTCardData) => void;
	onDoubleClick?: (data: NFTCardData) => void;
	onRightClick?: (data: NFTCardData) => void;
	onLongPress?: (data: NFTCardData) => void;
	onSwipe?: (data: NFTCardData, direction: string) => void;
	onSelect?: (data: NFTCardData, selected: boolean) => void;
	onFavorite?: (data: NFTCardData, favorited: boolean) => void;

	// Gesture config
	swipeVelocityThreshold?: number;
	swipeOffsetThreshold?: number;
}

// Touch and swipe tracking
interface TouchState {
	startX: number;
	startY: number;
	startTime: number;
	isLongPress: boolean;
}

// Advanced NFT interactions hook
export function useNFTInteractions(
	data: NFTCardData,
	options: UseNFTInteractionsOptions = {},
) {
	const {
		enableHover = true,
		enableClick = true,
		enableDoubleClick = false,
		enableRightClick = false,
		enableLongPress = false,
		enableSwipe = false,
		enableSelect = false,
		enableFavorite = false,
		longPressDelay = 500,
		doubleClickDelay = 300,
		swipeThreshold = 50,
		onInteraction,
		onHoverStart,
		onHoverEnd,
		onClick,
		onDoubleClick,
		onRightClick,
		onLongPress,
		onSwipe,
		onSelect,
		onFavorite,
	} = options;

	// State management
	const [isHovered, setIsHovered] = useState(false);
	const [isSelected, setIsSelected] = useState(false);
	const [isFavorited, setIsFavorited] = useState(false);
	const [isPressed, setIsPressed] = useState(false);

	// Refs for tracking
	const touchStateRef = useRef<TouchState | null>(null);
	const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
	const clickCountRef = useRef(0);
	const lastClickTimeRef = useRef(0);
	const elementRef = useRef<HTMLElement>(null);

	// Animation controls
	const controls = useAnimation();

	// Interaction tracking
	const trackInteraction = useCallback(
		(
			type: NFTInteractionType,
			position?: { x: number; y: number },
			metadata?: Record<string, unknown>,
		) => {
			const interaction: NFTInteraction = {
				type,
				data,
				timestamp: Date.now(),
				position,
				metadata,
			};

			onInteraction?.(interaction);
			return interaction;
		},
		[data, onInteraction],
	);

	// Hover interactions
	const handleHoverStart = useCallback(() => {
		if (!enableHover) return;

		setIsHovered(true);
		controls.start({
			scale: 1.05,
			transition: { duration: 0.2, ease: "easeOut" },
		});

		onHoverStart?.(data);
		trackInteraction("hover");
	}, [enableHover, onHoverStart, data, trackInteraction, controls]);

	const handleHoverEnd = useCallback(() => {
		if (!enableHover) return;

		setIsHovered(false);
		controls.start({
			scale: 1,
			transition: { duration: 0.2, ease: "easeOut" },
		});

		onHoverEnd?.(data);
	}, [enableHover, onHoverEnd, data, controls]);

	// Click interactions
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			if (!enableClick) return;

			const now = Date.now();
			const timeSinceLastClick = now - lastClickTimeRef.current;

			// Handle double click
			if (enableDoubleClick && timeSinceLastClick < doubleClickDelay) {
				clickCountRef.current++;
				if (clickCountRef.current === 2) {
					onDoubleClick?.(data);
					trackInteraction("doubleClick", {
						x: event.clientX,
						y: event.clientY,
					});
					clickCountRef.current = 0;
					return;
				}
			} else {
				clickCountRef.current = 1;
			}

			lastClickTimeRef.current = now;

			// Handle selection
			if (enableSelect) {
				const newSelectedState = !isSelected;
				setIsSelected(newSelectedState);
				onSelect?.(data, newSelectedState);
				trackInteraction("select");
				return;
			}

			onClick?.(data);
			trackInteraction("click", { x: event.clientX, y: event.clientY });

			// Animate click
			controls.start({
				scale: [1, 0.95, 1],
				transition: { duration: 0.1 },
			});
		},
		[
			enableClick,
			enableDoubleClick,
			enableSelect,
			isSelected,
			onClick,
			onDoubleClick,
			onSelect,
			data,
			trackInteraction,
			controls,
			doubleClickDelay,
		],
	);

	// Right click interaction
	const handleRightClick = useCallback(
		(event: React.MouseEvent) => {
			if (!enableRightClick) return;

			event.preventDefault();
			onRightClick?.(data);
			trackInteraction("rightClick", { x: event.clientX, y: event.clientY });
		},
		[enableRightClick, onRightClick, data, trackInteraction],
	);

	// Touch interactions
	const handleTouchStart = useCallback(
		(event: React.TouchEvent) => {
			const touch = event.touches[0];
			touchStateRef.current = {
				startX: touch.clientX,
				startY: touch.clientY,
				startTime: Date.now(),
				isLongPress: false,
			};

			setIsPressed(true);

			// Start long press timer
			if (enableLongPress) {
				longPressTimerRef.current = setTimeout(() => {
					if (touchStateRef.current) {
						touchStateRef.current.isLongPress = true;
					}
					onLongPress?.(data);
					trackInteraction("longPress");

					// Vibrate if available
					if (navigator.vibrate) {
						navigator.vibrate(50);
					}
				}, longPressDelay);
			}

			controls.start({
				scale: 0.98,
				transition: { duration: 0.1 },
			});
		},
		[
			enableLongPress,
			onLongPress,
			data,
			trackInteraction,
			controls,
			longPressDelay,
		],
	);

	const handleTouchMove = useCallback((event: React.TouchEvent) => {
		if (!touchStateRef.current) return;

		const touch = event.touches[0];
		const deltaX = Math.abs(touch.clientX - touchStateRef.current?.startX);
		const deltaY = Math.abs(touch.clientY - touchStateRef.current?.startY);

		// Cancel long press if moved too much
		if (deltaX > 10 || deltaY > 10) {
			if (longPressTimerRef.current) {
				clearTimeout(longPressTimerRef.current);
				longPressTimerRef.current = null;
			}
		}
	}, []);

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent) => {
			if (!touchStateRef.current) return;

			const touch = event.changedTouches[0];
			const deltaX = touch.clientX - touchStateRef.current.startX;
			const deltaY = touch.clientY - touchStateRef.current.startY;
			const deltaTime = Date.now() - touchStateRef.current.startTime;

			setIsPressed(false);

			// Clear long press timer
			if (longPressTimerRef.current) {
				clearTimeout(longPressTimerRef.current);
				longPressTimerRef.current = null;
			}

			// Handle swipe gestures
			if (enableSwipe && !touchStateRef.current.isLongPress) {
				const absDeltaX = Math.abs(deltaX);
				const absDeltaY = Math.abs(deltaY);

				if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
					let direction: string;

					if (absDeltaX > absDeltaY) {
						direction = deltaX > 0 ? "right" : "left";
					} else {
						direction = deltaY > 0 ? "down" : "up";
					}

					onSwipe?.(data, direction);
					trackInteraction(
						`swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}` as NFTInteractionType,
					);

					// Swipe animation
					controls
						.start({
							x:
								deltaX > swipeThreshold
									? 50
									: deltaX < -swipeThreshold
										? -50
										: 0,
							y:
								deltaY > swipeThreshold
									? 50
									: deltaY < -swipeThreshold
										? -50
										: 0,
							transition: { duration: 0.2 },
						})
						.then(() => {
							controls.start({ x: 0, y: 0 });
						});

					touchStateRef.current = null;
					return;
				}
			}

			// Handle as tap if not long press
			if (!touchStateRef.current.isLongPress && deltaTime < 300) {
				handleClick(event as unknown as React.MouseEvent);
			}

			controls.start({
				scale: 1,
				transition: { duration: 0.1 },
			});

			touchStateRef.current = null;
		},
		[
			enableSwipe,
			swipeThreshold,
			onSwipe,
			data,
			trackInteraction,
			controls,
			handleClick,
		],
	);

	// Keyboard interactions
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			switch (event.key) {
				case "Enter":
				case " ":
					event.preventDefault();
					handleClick({} as React.MouseEvent);
					break;
				case "f":
				case "F":
					if (enableFavorite) {
						event.preventDefault();
						const newFavoritedState = !isFavorited;
						setIsFavorited(newFavoritedState);
						onFavorite?.(data, newFavoritedState);
						trackInteraction("favorite");
					}
					break;
				case "s":
				case "S":
					if (enableSelect) {
						event.preventDefault();
						const newSelectedState = !isSelected;
						setIsSelected(newSelectedState);
						onSelect?.(data, newSelectedState);
						trackInteraction("select");
					}
					break;
			}
		},
		[
			enableFavorite,
			enableSelect,
			isFavorited,
			isSelected,
			onFavorite,
			onSelect,
			data,
			trackInteraction,
			handleClick,
		],
	);

	// Cleanup
	useEffect(() => {
		return () => {
			if (longPressTimerRef.current) {
				clearTimeout(longPressTimerRef.current);
			}
		};
	}, []);

	// Animation variants
	const variants = {
		idle: { scale: 1, rotate: 0 },
		hover: { scale: 1.05, rotate: 0 },
		pressed: { scale: 0.95, rotate: 0 },
		selected: {
			scale: 1.02,
			rotate: [0, -1, 1, 0],
			transition: { duration: 0.3 },
		},
		favorited: {
			scale: [1, 1.1, 1],
			rotate: [0, 5, -5, 0],
			transition: { duration: 0.4 },
		},
	};

	return {
		// State
		isHovered,
		isSelected,
		isFavorited,
		isPressed,

		// Animation
		controls,
		variants,

		// Ref
		elementRef,

		// Event handlers
		handlers: {
			onMouseEnter: handleHoverStart,
			onMouseLeave: handleHoverEnd,
			onClick: handleClick,
			onContextMenu: handleRightClick,
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
			onKeyDown: handleKeyDown,
		},

		// Manual controls
		select: useCallback(() => {
			if (enableSelect) {
				const newSelectedState = !isSelected;
				setIsSelected(newSelectedState);
				onSelect?.(data, newSelectedState);
				trackInteraction("select");
			}
		}, [enableSelect, isSelected, onSelect, data, trackInteraction]),

		favorite: useCallback(() => {
			if (enableFavorite) {
				const newFavoritedState = !isFavorited;
				setIsFavorited(newFavoritedState);
				onFavorite?.(data, newFavoritedState);
				trackInteraction("favorite");
			}
		}, [enableFavorite, isFavorited, onFavorite, data, trackInteraction]),

		reset: useCallback(() => {
			setIsHovered(false);
			setIsSelected(false);
			setIsFavorited(false);
			setIsPressed(false);
			controls.stop();
			controls.set("idle");
		}, [controls]),
	};
}

// Batch interaction hook for multiple NFTs
export function useNFTBatchInteractions() {
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
	const [interactionHistory, setInteractionHistory] = useState<
		NFTInteraction[]
	>([]);

	const handleInteraction = useCallback((interaction: NFTInteraction) => {
		setInteractionHistory((prev) => [...prev.slice(-99), interaction]); // Keep last 100 interactions
	}, []);

	const selectMultiple = useCallback((itemIds: string[]) => {
		setSelectedItems((prev) => new Set([...prev, ...itemIds]));
	}, []);

	const deselectMultiple = useCallback((itemIds: string[]) => {
		setSelectedItems((prev) => {
			const newSet = new Set(prev);
			itemIds.forEach((id) => newSet.delete(id));
			return newSet;
		});
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedItems(new Set());
	}, []);

	const selectAll = useCallback((allItemIds: string[]) => {
		setSelectedItems(new Set(allItemIds));
	}, []);

	const toggleFavorite = useCallback((itemId: string) => {
		setFavoritedItems((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	}, []);

	const clearHistory = useCallback(() => {
		setInteractionHistory([]);
	}, []);

	return {
		selectedItems,
		favoritedItems,
		interactionHistory,
		handleInteraction,
		selectMultiple,
		deselectMultiple,
		clearSelection,
		selectAll,
		toggleFavorite,
		clearHistory,
	};
}

// Analytics hook for tracking NFT interactions
export function useNFTAnalytics() {
	const [analytics, setAnalytics] = useState({
		totalInteractions: 0,
		interactionCounts: {} as Record<NFTInteractionType, number>,
		averageSessionDuration: 0,
		mostInteractedItems: [] as Array<{ itemId: string; count: number }>,
	});

	const trackInteraction = useCallback((interaction: NFTInteraction) => {
		setAnalytics((prev) => ({
			...prev,
			totalInteractions: prev.totalInteractions + 1,
			interactionCounts: {
				...prev.interactionCounts,
				[interaction.type]: (prev.interactionCounts[interaction.type] || 0) + 1,
			},
		}));
	}, []);

	const getInteractionRate = useCallback(
		(type: NFTInteractionType) => {
			return analytics.totalInteractions > 0
				? (analytics.interactionCounts[type] || 0) / analytics.totalInteractions
				: 0;
		},
		[analytics],
	);

	return {
		analytics,
		trackInteraction,
		getInteractionRate,
	};
}
