"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";

interface NFTRevealModalProps {
	isVisible: boolean;
	nftResult: {
		rarity: string;
		collection: string;
		tokenId: string;
	};
}

export default function NFTRevealModal({ isVisible, nftResult }: NFTRevealModalProps) {
	const [showCard, setShowCard] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showCelebration, setShowCelebration] = useState(false);

	useEffect(() => {
		if (isVisible) {
			// Stagger the animations
			setTimeout(() => setShowCard(true), 300);
			setTimeout(() => setShowDetails(true), 1200);
			setTimeout(() => setShowCelebration(true), 1800);
		} else {
			// Reset states when hidden
			setShowCard(false);
			setShowDetails(false);
			setShowCelebration(false);
		}
	}, [isVisible]);

	if (!isVisible) return null;

	const rarityConfig = getRarityConfig(
		Rarity[nftResult.rarity as keyof typeof Rarity] || Rarity.Common
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
			{/* Enhanced Background Effects */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Multiple layered explosion rings */}
				<div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full animate-ping opacity-10`}></div>
				<div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full animate-ping opacity-5`} style={{ animationDelay: '0.5s' }}></div>
				<div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full animate-ping opacity-3`} style={{ animationDelay: '1s' }}></div>
				
				{/* Starburst rays */}
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className={`absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t ${rarityConfig.bgGradient} opacity-20`}
						style={{
							transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
							animation: `starRay 2s ease-out ${i * 0.1}s infinite`
						}}
					></div>
				))}
			</div>

			{/* Main Content */}
			<div className="relative z-10">
				{/* Entrance Effect */}
				<div className={`transition-all duration-1000 ${showCard ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
					{/* Magical Glow Border */}
					<div className={`absolute -inset-8 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full blur-2xl opacity-30 animate-pulse`}></div>
					
					{/* Main reveal card */}
					<div className="relative w-96 h-[28rem] perspective-1000">
						<div className={`relative w-full h-full transform-style-preserve-3d ${showCard ? 'animate-[flipCard_1.2s_ease-in-out]' : ''} bg-gradient-to-br from-background to-content1 rounded-3xl shadow-2xl overflow-hidden border-2 border-white/20`}>
							{/* Card front (hidden after flip) - Mystery box effect */}
							<div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 rounded-3xl flex items-center justify-center border-4 border-warning/30">
								<div className="relative">
									{/* Mystery box with question mark */}
									<div className="w-24 h-24 bg-gradient-to-br from-zinc-600 to-zinc-800 rounded-2xl border-4 border-warning/40 flex items-center justify-center transform rotate-12 animate-spin shadow-2xl">
										<div className="text-4xl font-bold text-warning animate-pulse">?</div>
									</div>
									{/* Glowing energy around mystery box */}
									<div className="absolute inset-0 bg-gradient-to-r from-warning/20 via-orange-400/30 to-warning/20 rounded-full blur-xl animate-pulse"></div>
									{/* Floating sparkles */}
									{[...Array(6)].map((_, i) => (
										<div
											key={i}
											className="absolute w-2 h-2 bg-warning rounded-full animate-ping"
											style={{
												left: `${20 + Math.random() * 60}%`,
												top: `${20 + Math.random() * 60}%`,
												animationDelay: `${i * 0.3}s`,
												animationDuration: '2s'
											}}
										></div>
									))}
								</div>
							</div>
							
							{/* Card back (revealed after flip) */}
							<div className="absolute inset-0 w-full h-full backface-hidden transform rotateY-180 rounded-3xl overflow-hidden">
								{/* NFT Display with enhanced border */}
								<div className={`w-full h-full bg-gradient-to-br ${rarityConfig.bgGradient} p-2`}>
									<div className="w-full h-full bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center space-y-8 p-8 relative overflow-hidden border border-white/10">
										{/* Subtle rarity glow */}
										<div className="absolute inset-0 opacity-5">
											<div className={`w-full h-full bg-gradient-to-br ${rarityConfig.bgGradient} rounded-2xl`}></div>
										</div>
										
										{/* Glassmorphism rarity badge */}
										<div className={`relative z-10 transition-all duration-700 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
											<div className="relative px-8 py-4 rounded-2xl bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl border border-white/20 shadow-2xl">
												{/* Inner glass highlight */}
												<div className="absolute inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
												{/* Rarity border accent */}
												<div className={`absolute inset-0 rounded-2xl border-2 ${rarityConfig.borderColor} opacity-50`}></div>
												<span className={`relative z-10 ${rarityConfig.textColor} font-bold text-2xl flex items-center gap-3 drop-shadow-lg`}>
													<span className="text-3xl animate-bounce">{rarityConfig.emoji}</span>
													<span className="tracking-wide">{nftResult.rarity}</span>
												</span>
											</div>
										</div>
										
										{/* Enhanced NFT Card with Crystal Theme */}
										<div className={`relative group transition-all duration-700 delay-300 ${showDetails ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
											{/* Multiple glow layers */}
											<div className={`absolute -inset-4 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-3xl blur-2xl opacity-30 animate-pulse`}></div>
											<div className={`absolute -inset-2 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-3xl blur-lg opacity-50 animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
											
											<div className={`relative w-56 h-56 bg-gradient-to-br ${rarityConfig.bgGradient} rounded-3xl flex items-center justify-center border-4 border-white/40 shadow-2xl overflow-hidden`}>
												{/* Inner card surface */}
												<div className="absolute inset-2 bg-gradient-to-br from-background/95 to-background/80 rounded-2xl backdrop-blur-xl"></div>
												
												{/* NFT Crystal/Gem representation */}
												<div className="relative z-10">
													{/* Main crystal */}
													<div className={`w-24 h-24 ${rarityConfig.bgGradient} rounded-lg transform rotate-45 border-4 border-white/60 shadow-2xl animate-[float_3s_ease-in-out_infinite] relative overflow-hidden`}>
														{/* Crystal facets */}
														<div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
														<div className="absolute top-0 left-0 w-full h-2 bg-white/30"></div>
														<div className="absolute top-0 left-0 w-2 h-full bg-white/30"></div>
													</div>
													
													{/* Rarity indicator */}
													<div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black animate-bounce">
														{rarityConfig.emoji}
													</div>
													
													{/* Energy glow */}
													<div className={`absolute inset-0 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-full blur-xl opacity-20 animate-pulse`}></div>
												</div>
												
												{/* Enhanced shimmer effect */}
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
												
												{/* Floating energy particles */}
												{[...Array(8)].map((_, i) => (
													<div
														key={i}
														className={`absolute w-1 h-1 rounded-full animate-ping opacity-60`}
														style={{
															backgroundColor: rarityConfig.bgGradient.includes('orange') ? '#f59e0b' : rarityConfig.bgGradient.includes('purple') ? '#a855f7' : rarityConfig.bgGradient.includes('blue') ? '#3b82f6' : rarityConfig.bgGradient.includes('green') ? '#10b981' : '#6b7280',
															left: `${15 + Math.random() * 70}%`,
															top: `${15 + Math.random() * 70}%`,
															animationDelay: `${i * 0.3}s`,
															animationDuration: '3s'
														}}
													></div>
												))}
											</div>
										</div>
										
										{/* Enhanced NFT Details */}
										<div className={`text-center space-y-3 transition-all duration-700 delay-500 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
											<h3 className={`text-3xl font-bold bg-gradient-to-r ${rarityConfig.bgGradient} bg-clip-text text-transparent drop-shadow-lg`}>
												NFT #{nftResult.tokenId}
											</h3>
											<div className="flex items-center justify-center space-x-2">
												<div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
												<p className="text-sm text-foreground/70 font-mono tracking-wider">
													{nftResult.collection.slice(0, 6)}...{nftResult.collection.slice(-4)}
												</p>
												<div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
											</div>
										</div>
										
										{/* Glassmorphism Celebration */}
										<div className={`text-center transition-all duration-700 delay-700 ${showCelebration ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
											<div className="relative bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20 shadow-xl">
												{/* Inner glass highlight */}
												<div className="absolute inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl"></div>
												<p className="relative z-10 text-2xl font-bold text-warning animate-pulse drop-shadow-lg">
													🎉 CONGRATULATIONS! 🎉
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				{/* Enhanced Floating Particles */}
				<div className="absolute inset-0 pointer-events-none">
					{[...Array(20)].map((_, i) => (
						<div
							key={i}
							className={`absolute rounded-full bg-gradient-to-r ${rarityConfig.bgGradient} animate-float opacity-60`}
							style={{
								width: `${Math.random() * 8 + 4}px`,
								height: `${Math.random() * 8 + 4}px`,
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${i * 0.3}s`,
								animationDuration: `${3 + Math.random() * 2}s`
							}}
						></div>
					))}
				</div>
				
				{/* Confetti Effect */}
				{showCelebration && (
					<div className="absolute inset-0 pointer-events-none">
						{[...Array(30)].map((_, i) => (
							<div
								key={i}
								className="absolute w-2 h-2 animate-[confetti_3s_ease-out_infinite]"
								style={{
									backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][i % 4],
									left: `${Math.random() * 100}%`,
									top: '-5%',
									animationDelay: `${i * 0.1}s`
								}}
							></div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}