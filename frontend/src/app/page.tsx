"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useState } from "react";

export default function Home() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [lastSpin, setLastSpin] = useState<string | null>(null);

	const handleSpin = async () => {
		setIsSpinning(true);
		// Simulate spin delay
		setTimeout(() => {
			setIsSpinning(false);
			setLastSpin("Epic NFT #1337");
		}, 3000);
	};

	const rarityStats = [
		{
			name: "Common",
			percentage: 70,
			color: "default",
			count: 1247,
			bgGradient: "from-zinc-600 to-zinc-700",
			glowColor: "zinc-500/20",
			borderColor: "zinc-500/30",
		},
		{
			name: "Uncommon",
			percentage: 20,
			color: "primary",
			count: 892,
			bgGradient: "from-green-500 to-emerald-600",
			glowColor: "green-500/30",
			borderColor: "green-400/40",
		},
		{
			name: "Rare",
			percentage: 6,
			color: "secondary",
			count: 156,
			bgGradient: "from-blue-500 to-purple-600",
			glowColor: "blue-500/40",
			borderColor: "blue-400/50",
		},
		{
			name: "Epic",
			percentage: 3,
			color: "warning",
			count: 43,
			bgGradient: "from-purple-500 to-pink-600",
			glowColor: "purple-500/40",
			borderColor: "purple-400/50",
		},
		{
			name: "Legendary",
			percentage: 1,
			color: "danger",
			count: 7,
			bgGradient: "from-orange-500 to-red-600",
			glowColor: "orange-500/50",
			borderColor: "orange-400/60",
		},
	] as const;

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-6 py-16">
				{/* Hero Section */}
				<div className="text-center mb-24">
					<h1 className="text-6xl md:text-7xl font-light mb-10 tracking-tight leading-tight">
						<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent font-extralight">
							Provably Fair
						</span>
						<br />
						<span className="text-foreground font-light">NFT Gacha</span>
					</h1>
					<p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
						Every spin is cryptographically guaranteed with elegant simplicity.
						<br className="hidden sm:block" />
						No hidden algorithms, no manipulation—just pure randomness backed by
						decentralized infrastructure.
					</p>
					<div className="relative group inline-block">
						<div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-orange-500/20 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
						<div className="relative bg-gradient-to-r from-warning/10 to-orange-500/10 backdrop-blur-xl border border-warning/30 rounded-full px-6 py-3 shadow-xl">
							<div className="flex items-center space-x-3">
								<div className="w-6 h-6 bg-gradient-to-br from-warning to-orange-400 rounded-full flex items-center justify-center">
									<span className="text-xs font-bold text-black">⚡</span>
								</div>
								<span className="text-base font-semibold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent tracking-wide">
									WAVS-DRAND Powered
								</span>
								<div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Spin Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
					{/* Spin Controls */}
					<div className="lg:col-span-2">
						<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl">
							<CardHeader className="pb-8">
								<div className="flex justify-between items-center w-full">
									<h2 className="text-3xl font-light text-foreground tracking-tight">
										Gacha Spinner
									</h2>
									<div className="relative group">
										<div className="absolute inset-0 bg-gradient-to-r from-warning/30 to-orange-500/30 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
										<div className="relative bg-gradient-to-r from-warning/20 to-orange-500/20 backdrop-blur-xl border border-warning/30 rounded-xl px-4 py-2 shadow-xl">
											<div className="flex items-center space-x-2">
												<span className="text-xs font-medium text-warning/80 uppercase tracking-wide">
													Entry Fee
												</span>
											</div>
											<div className="flex items-center space-x-1 mt-1">
												<span className="text-xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
													100
												</span>
												<span className="text-sm font-semibold text-warning/90">
													TOKENS
												</span>
												<div className="w-5 h-5 bg-gradient-to-br from-warning to-orange-400 rounded-full flex items-center justify-center ml-1">
													<span className="text-xs">💰</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardBody className="py-16">
								<div className="flex flex-col items-center space-y-10">
									{/* Enhanced Spinner Visual */}
									<div className="relative group">
										{/* Outer glow rings */}
										<div
											className={`absolute inset-0 w-64 h-64 rounded-full ${isSpinning ? "animate-pulse" : ""}`}
										>
											<div
												className="w-full h-full rounded-full border-2 border-warning/20 animate-spin"
												style={{ animationDuration: "8s" }}
											></div>
										</div>
										<div
											className={`absolute inset-2 w-60 h-60 rounded-full ${isSpinning ? "animate-pulse" : ""}`}
										>
											<div
												className="w-full h-full rounded-full border border-warning/10 animate-spin"
												style={{
													animationDuration: "12s",
													animationDirection: "reverse",
												}}
											></div>
										</div>

										{/* Main spinner */}
										<div
											className={`relative w-64 h-64 rounded-full bg-gradient-to-r from-primary via-warning to-orange-500 p-3 ${isSpinning ? "spin-wobble" : "hover:scale-105 transition-all duration-300"} shadow-2xl shadow-warning/20`}
										>
											{/* Inner glass surface */}
											<div className="w-full h-full rounded-full bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl flex items-center justify-center border border-warning/30 relative overflow-hidden">
												{/* Shimmer effect */}
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>

												{/* Logo */}
												<div className="relative z-10 filter drop-shadow-2xl">
													<svg
														className="w-20 h-20 text-warning drop-shadow-lg"
														viewBox="227 210 589 590"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M0,0 L47,0 L78,4 L101,9 L125,17 L149,28 L164,37 L181,49 L194,60 L202,67 L209,74 L218,85 L228,98 L239,115 L250,135 L260,160 L267,185 L271,208 L272,218 L272,258 L269,281 L264,302 L259,319 L248,347 L236,370 L225,386 L217,396 L208,406 L201,413 L196,418 L188,426 L175,436 L160,446 L142,456 L125,464 L102,471 L80,475 L58,476 L41,475 L22,471 L7,466 L-12,457 L-23,450 L-36,440 L-48,428 L-59,414 L-68,399 L-75,383 L-79,371 L-82,353 L-83,328 L-81,310 L-76,291 L-68,275 L-56,259 L-46,249 L-31,240 L-16,234 L-7,232 L11,232 L25,236 L35,242 L42,248 L48,257 L52,268 L53,278 L49,276 L40,269 L34,267 L22,267 L12,272 L4,279 L-5,291 L-11,303 L-13,311 L-13,331 L-10,345 L-5,358 L2,368 L11,378 L21,385 L38,393 L56,397 L82,397 L98,394 L114,388 L126,382 L142,370 L155,358 L164,347 L174,333 L185,312 L192,293 L197,272 L199,251 L199,240 L197,214 L192,192 L184,171 L174,152 L163,136 L154,125 L146,117 L135,108 L122,98 L109,90 L93,82 L79,76 L58,70 L41,67 L31,66 L-1,66 L-24,69 L-47,74 L-71,82 L-98,95 L-117,107 L-134,120 L-148,132 L-163,147 L-172,158 L-185,175 L-195,190 L-205,208 L-216,231 L-222,246 L-229,271 L-234,296 L-236,312 L-237,326 L-237,348 L-234,380 L-229,406 L-223,430 L-224,432 L-230,422 L-241,399 L-249,377 L-256,349 L-260,325 L-262,304 L-262,269 L-259,240 L-254,214 L-246,188 L-238,168 L-228,148 L-215,127 L-202,110 L-191,97 L-182,87 L-165,70 L-151,59 L-136,48 L-112,33 L-97,25 L-70,14 L-45,7 L-25,3 Z "
															fill="currentColor"
															transform="translate(489,210)"
														/>
														<path
															d="M0,0 L26,0 L46,3 L67,9 L83,16 L94,22 L105,30 L119,41 L136,58 L144,69 L154,87 L160,101 L164,116 L166,128 L166,161 L162,179 L155,195 L149,206 L139,220 L130,229 L116,238 L105,243 L85,247 L74,247 L57,243 L45,236 L37,227 L32,217 L32,212 L43,215 L56,215 L67,211 L76,205 L82,200 L90,189 L94,180 L96,171 L96,146 L92,130 L86,118 L78,108 L67,98 L54,90 L38,83 L19,78 L10,77 L-3,77 L-17,79 L-35,85 L-50,93 L-63,103 L-74,113 L-83,124 L-92,136 L-100,150 L-108,167 L-115,191 L-118,212 L-118,246 L-113,276 L-108,292 L-99,313 L-88,332 L-75,349 L-64,361 L-52,372 L-38,382 L-22,391 L-4,399 L14,405 L34,409 L55,411 L66,411 L92,409 L114,405 L138,398 L162,388 L181,378 L199,366 L212,356 L222,348 L234,337 L246,325 L255,314 L269,295 L280,277 L291,256 L300,233 L306,214 L311,192 L314,172 L316,143 L316,130 L314,101 L311,78 L314,81 L322,100 L329,124 L334,151 L336,176 L336,201 L333,235 L328,260 L321,285 L312,309 L300,334 L291,350 L279,367 L268,381 L259,391 L252,399 L239,412 L228,421 L213,432 L193,445 L169,457 L140,468 L111,476 L89,480 L73,482 L31,482 L6,479 L-21,473 L-44,465 L-62,457 L-81,447 L-93,439 L-106,429 L-120,417 L-130,407 L-139,396 L-151,381 L-163,361 L-174,338 L-181,319 L-187,295 L-191,268 L-191,231 L-188,203 L-183,177 L-177,155 L-167,131 L-154,106 L-144,91 L-135,79 L-124,66 L-113,54 L-103,45 L-83,30 L-64,19 L-47,11 L-29,5 L-9,1 Z "
															fill="currentColor"
															transform="translate(480,318)"
														/>
													</svg>
												</div>
											</div>
										</div>
									</div>

									{/* Spin Button */}
									<Button
										size="lg"
										className="px-20 py-5 text-xl font-medium tracking-wide"
										color="warning"
										variant="shadow"
										isLoading={isSpinning}
										onPress={handleSpin}
									>
										{isSpinning ? "Spinning..." : "SPIN NOW"}
									</Button>

									{/* Enhanced Last Result */}
									{lastSpin && (
										<div className="relative group">
											<div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-80 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
											<Card className="relative bg-gradient-to-br from-content2/30 to-content3/20 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
												<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
												<CardBody className="py-6 px-8 relative z-10">
													<div className="flex items-center justify-center space-x-3">
														<div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
															<span className="text-sm">🎉</span>
														</div>
														<div className="text-center">
															<p className="text-xs font-medium text-purple-300 uppercase tracking-wide mb-1">
																Latest Reward
															</p>
															<p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
																{lastSpin}
															</p>
														</div>
														<div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
															<span className="text-sm">✨</span>
														</div>
													</div>
												</CardBody>
											</Card>
										</div>
									)}
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Rarity Breakdown */}
					<div>
						<Card className="bg-content1/20 backdrop-blur-xl h-full border border-white/10 shadow-2xl">
							<CardHeader className="pb-6">
								<h3 className="text-2xl font-light text-foreground tracking-tight">
									Drop Rates
								</h3>
							</CardHeader>
							<CardBody className="space-y-4">
								{rarityStats.map((rarity) => (
									<div key={rarity.name} className="group relative">
										{/* Glow effect */}
										<div
											className={`absolute inset-0 bg-gradient-to-r ${rarity.bgGradient} rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500 scale-95 group-hover:scale-100`}
										></div>

										{/* Main card */}
										<div className="relative bg-content2/10 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-content2/20 transition-all duration-300 group-hover:border-white/20">
											{/* Header with rarity name and stats */}
											<div className="flex justify-between items-center mb-3">
												<div
													className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${rarity.bgGradient} border border-${rarity.borderColor} shadow-lg shadow-${rarity.glowColor}`}
												>
													<span className="text-sm font-bold text-white drop-shadow-sm">
														{rarity.name}
													</span>
												</div>
												<div className="text-right">
													<div
														className={`text-lg font-bold bg-gradient-to-r ${rarity.bgGradient} bg-clip-text text-transparent`}
													>
														{rarity.percentage}%
													</div>
													<div className="text-xs text-foreground/60 font-medium">
														{rarity.count} items
													</div>
												</div>
											</div>

											{/* Enhanced progress bar */}
											<div className="relative">
												<div className="h-3 bg-content3/30 backdrop-blur-sm rounded-full overflow-hidden border border-white/5">
													<div
														className={`h-full bg-gradient-to-r ${rarity.bgGradient} rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden`}
														style={{ width: `${rarity.percentage}%` }}
													>
														{/* Shimmer effect */}
														<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</CardBody>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
