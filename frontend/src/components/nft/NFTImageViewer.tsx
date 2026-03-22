"use client";

import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import {
	memo,
	startTransition,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/theme-config";
import { Modal, ModalContent } from "../../ui/Modal";

const MIN_SCALE = 1;
const MAX_SCALE = 5;

interface NFTImageViewerProps {
	src: string;
	alt: string;
	isOpen: boolean;
	onClose: () => void;
	unoptimized?: boolean;
	backSrc?: string | null | undefined;
}

export const NFTImageViewer = memo<NFTImageViewerProps>(
	({ src, alt, isOpen, onClose, unoptimized = false, backSrc }) => {
		const [scale, setScale] = useState(1);
		const [translate, setTranslate] = useState({ x: 0, y: 0 });
		const [isDragging, setIsDragging] = useState(false);
		const [isLoaded, setIsLoaded] = useState(false);
		const [showBack, setShowBack] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);
		const dragStart = useRef({ x: 0, y: 0 });
		const translateStart = useRef({ x: 0, y: 0 });

		const activeSrc = showBack && backSrc ? backSrc : src;

		const reset = useCallback(() => {
			setScale(1);
			setTranslate({ x: 0, y: 0 });
			setShowBack((prev) => {
				// Only reset loaded state if we're switching back to front (image source changes)
				if (prev) setIsLoaded(false);
				return false;
			});
		}, []);

		// Reset on close
		useEffect(() => {
			if (!isOpen) reset();
		}, [isOpen, reset]);

		const clampTranslate = useCallback(
			(x: number, y: number, currentScale: number) => {
				if (currentScale <= 1) return { x: 0, y: 0 };
				const maxOffset = ((currentScale - 1) / 2) * 100;
				return {
					x: Math.max(-maxOffset, Math.min(maxOffset, x)),
					y: Math.max(-maxOffset, Math.min(maxOffset, y)),
				};
			},
			[],
		);

		const handleWheel = useCallback(
			(e: React.WheelEvent) => {
				e.stopPropagation();
				const delta = e.deltaY > 0 ? -0.3 : 0.3;
				setScale((prev) => {
					const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta));
					if (next <= 1) {
						setTranslate({ x: 0, y: 0 });
					} else {
						setTranslate((t) => clampTranslate(t.x, t.y, next));
					}
					return next;
				});
			},
			[clampTranslate],
		);

		const handlePointerDown = useCallback(
			(e: React.PointerEvent) => {
				if (scale <= 1) return;
				e.preventDefault();
				setIsDragging(true);
				dragStart.current = { x: e.clientX, y: e.clientY };
				translateStart.current = { ...translate };
				(e.target as HTMLElement).setPointerCapture(e.pointerId);
			},
			[scale, translate],
		);

		const handlePointerMove = useCallback(
			(e: React.PointerEvent) => {
				if (!isDragging) return;
				const container = containerRef.current;
				if (!container) return;
				const rect = container.getBoundingClientRect();
				const dx =
					((e.clientX - dragStart.current.x) / rect.width) * 50;
				const dy =
					((e.clientY - dragStart.current.y) / rect.height) * 50;
				setTranslate(
					clampTranslate(
						translateStart.current.x + dx,
						translateStart.current.y + dy,
						scale,
					),
				);
			},
			[isDragging, scale, clampTranslate],
		);

		const handlePointerUp = useCallback(() => {
			setIsDragging(false);
		}, []);

		const handleDoubleClick = useCallback(() => {
			if (scale > 1) {
				setScale(1);
				setTranslate({ x: 0, y: 0 });
			} else {
				setScale(3);
			}
		}, [scale]);

		const zoomIn = useCallback(() => {
			setScale((prev) => {
				const next = Math.min(MAX_SCALE, prev + 0.5);
				if (next <= 1) setTranslate({ x: 0, y: 0 });
				return next;
			});
		}, []);

		const zoomOut = useCallback(() => {
			setScale((prev) => {
				const next = Math.max(MIN_SCALE, prev - 0.5);
				if (next <= 1) setTranslate({ x: 0, y: 0 });
				else setTranslate((t) => clampTranslate(t.x, t.y, next));
				return next;
			});
		}, [clampTranslate]);

		return (
			<Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="lg" hideCloseButton>
				<ModalContent className="!bg-black/80 !backdrop-blur-2xl !border-white/10 !p-0 !max-w-[90vw] !max-h-[90vh] !w-auto !h-auto">
					{/* Close button */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/70 transition hover:scale-105 hover:text-white"
						aria-label="Close viewer"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
							<title>Close</title>
							<path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>

					{/* Zoom controls */}
					<div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1.5">
						<button
							type="button"
							onClick={zoomOut}
							disabled={scale <= MIN_SCALE}
							className="text-white/70 hover:text-white disabled:text-white/30 transition p-1"
							aria-label="Zoom out"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
								<title>Zoom out</title>
								<path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
							</svg>
						</button>
						<span className="text-white/60 text-xs font-mono min-w-[3ch] text-center select-none">
							{Math.round(scale * 100)}%
						</span>
						<button
							type="button"
							onClick={zoomIn}
							disabled={scale >= MAX_SCALE}
							className="text-white/70 hover:text-white disabled:text-white/30 transition p-1"
							aria-label="Zoom in"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
								<title>Zoom in</title>
								<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
							</svg>
						</button>
						{backSrc && (
							<>
								<div className="w-px h-4 bg-white/20" />
								<button
									type="button"
									onClick={() => {
										setIsLoaded(false);
										setShowBack((prev) => !prev);
									}}
									className="text-white/70 hover:text-white transition p-1"
									aria-label={showBack ? "Show front" : "Show back"}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
										<title>{showBack ? "Show front" : "Show back"}</title>
										<path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-11.23-3.15a.75.75 0 0 0 1.449.39A5.5 5.5 0 0 1 14.7 6.2l.312.311H12.58a.75.75 0 0 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V3.627a.75.75 0 0 0-1.5 0v2.033l-.312-.311A7 7 0 0 0 3.694 8.462l.388-.188Z" clipRule="evenodd" />
									</svg>
								</button>
								<span className="text-white/50 text-xs select-none">
									{showBack ? "Back" : "Front"}
								</span>
							</>
						)}
						<div className="w-px h-4 bg-white/20" />
						<button
							type="button"
							onClick={reset}
							disabled={scale === 1 && !showBack}
							className="text-white/70 hover:text-white disabled:text-white/30 transition p-1"
							aria-label="Reset zoom"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
								<title>Reset</title>
								<path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.598a.75.75 0 0 0-.75.75v3.634a.75.75 0 0 0 1.5 0v-2.033l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm-11.23-3.15a.75.75 0 0 0 1.449.39A5.5 5.5 0 0 1 14.7 6.2l.312.311H12.58a.75.75 0 0 0 0 1.5h3.634a.75.75 0 0 0 .75-.75V3.627a.75.75 0 0 0-1.5 0v2.033l-.312-.311A7 7 0 0 0 3.694 8.462l.388-.188Z" clipRule="evenodd" />
							</svg>
						</button>
					</div>

					{/* Hint text */}
					<AnimatePresence>
						{scale <= 1 && isLoaded && (
							<motion.p
								className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-white/40 text-xs select-none pointer-events-none"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ delay: 0.5 }}
							>
								Scroll to zoom, double-click to 3x
							</motion.p>
						)}
					</AnimatePresence>

					{/* Image container */}
					<div
						ref={containerRef}
						className={cn(
							"relative overflow-hidden select-none",
							"w-[80vw] h-[80vh] max-w-[800px] max-h-[800px]",
							scale > 1 ? "cursor-grab" : "cursor-zoom-in",
							isDragging && "cursor-grabbing",
						)}
						onWheel={handleWheel}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						onDoubleClick={handleDoubleClick}
					>
						<div
							className="w-full h-full transition-transform"
							style={{
								transform: `scale(${scale}) translate(${translate.x}%, ${translate.y}%)`,
								transitionDuration: isDragging ? "0ms" : "200ms",
								transitionTimingFunction: "ease-out",
							}}
						>
							<NextImage
								key={activeSrc}
								src={activeSrc}
								alt={showBack ? `${alt} (back)` : alt}
								fill
								className={cn(
									"object-contain transition-opacity duration-300",
									isLoaded ? "opacity-100" : "opacity-0",
								)}
								unoptimized={unoptimized}
								onLoad={() => startTransition(() => setIsLoaded(true))}
								sizes="80vw"
								draggable={false}
							/>
						</div>

						{/* Loading spinner */}
						{!isLoaded && (
							<div className="absolute inset-0 flex items-center justify-center">
								<motion.div
									className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full"
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								/>
							</div>
						)}
					</div>
				</ModalContent>
			</Modal>
		);
	},
);
NFTImageViewer.displayName = "NFTImageViewer";
