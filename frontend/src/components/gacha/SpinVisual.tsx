"use client";

import { cn } from "../../lib/theme-config";

const LOGO_PATH_OUTER =
	"M0,0 L47,0 L78,4 L101,9 L125,17 L149,28 L164,37 L181,49 L194,60 L202,67 L209,74 L218,85 L228,98 L239,115 L250,135 L260,160 L267,185 L271,208 L272,218 L272,258 L269,281 L264,302 L259,319 L248,347 L236,370 L225,386 L217,396 L208,406 L201,413 L196,418 L188,426 L175,436 L160,446 L142,456 L125,464 L102,471 L80,475 L58,476 L41,475 L22,471 L7,466 L-12,457 L-23,450 L-36,440 L-48,428 L-59,414 L-68,399 L-75,383 L-79,371 L-82,353 L-83,328 L-81,310 L-76,291 L-68,275 L-56,259 L-46,249 L-31,240 L-16,234 L-7,232 L11,232 L25,236 L35,242 L42,248 L48,257 L52,268 L53,278 L49,276 L40,269 L34,267 L22,267 L12,272 L4,279 L-5,291 L-11,303 L-13,311 L-13,331 L-10,345 L-5,358 L2,368 L11,378 L21,385 L38,393 L56,397 L82,397 L98,394 L114,388 L126,382 L142,370 L155,358 L164,347 L174,333 L185,312 L192,293 L197,272 L199,251 L199,240 L197,214 L192,192 L184,171 L174,152 L163,136 L154,125 L146,117 L135,108 L122,98 L109,90 L93,82 L79,76 L58,70 L41,67 L31,66 L-1,66 L-24,69 L-47,74 L-71,82 L-98,95 L-117,107 L-134,120 L-148,132 L-163,147 L-172,158 L-185,175 L-195,190 L-205,208 L-216,231 L-222,246 L-229,271 L-234,296 L-236,312 L-237,326 L-237,348 L-234,380 L-229,406 L-223,430 L-224,432 L-230,422 L-241,399 L-249,377 L-256,349 L-260,325 L-262,304 L-262,269 L-259,240 L-254,214 L-246,188 L-238,168 L-228,148 L-215,127 L-202,110 L-191,97 L-182,87 L-165,70 L-151,59 L-136,48 L-112,33 L-97,25 L-70,14 L-45,7 L-25,3 Z ";

const LOGO_PATH_INNER =
	"M0,0 L26,0 L46,3 L67,9 L83,16 L94,22 L105,30 L119,41 L136,58 L144,69 L154,87 L160,101 L164,116 L166,128 L166,161 L162,179 L155,195 L149,206 L139,220 L130,229 L116,238 L105,243 L85,247 L74,247 L57,243 L45,236 L37,227 L32,217 L32,212 L43,215 L56,215 L67,211 L76,205 L82,200 L90,189 L94,180 L96,171 L96,146 L92,130 L86,118 L78,108 L67,98 L54,90 L38,83 L19,78 L10,77 L-3,77 L-17,79 L-35,85 L-50,93 L-63,103 L-74,113 L-83,124 L-92,136 L-100,150 L-108,167 L-115,191 L-118,212 L-118,246 L-113,276 L-108,292 L-99,313 L-88,332 L-75,349 L-64,361 L-52,372 L-38,382 L-22,391 L-4,399 L14,405 L34,409 L55,411 L66,411 L92,409 L114,405 L138,398 L162,388 L181,378 L199,366 L212,356 L222,348 L234,337 L246,325 L255,314 L269,295 L280,277 L291,256 L300,233 L306,214 L311,192 L314,172 L316,143 L316,130 L314,101 L311,78 L314,81 L322,100 L329,124 L334,151 L336,176 L336,201 L333,235 L328,260 L321,285 L312,309 L300,334 L291,350 L279,367 L268,381 L259,391 L252,399 L239,412 L228,421 L213,432 L193,445 L169,457 L140,468 L111,476 L89,480 L73,482 L31,482 L6,479 L-21,473 L-44,465 L-62,457 L-81,447 L-93,439 L-106,429 L-120,417 L-130,407 L-139,396 L-151,381 L-163,361 L-174,338 L-181,319 L-187,295 L-191,268 L-191,231 L-188,203 L-183,177 L-177,155 L-167,131 L-154,106 L-144,91 L-135,79 L-124,66 L-113,54 L-103,45 L-83,30 L-64,19 L-47,11 L-29,5 L-9,1 Z ";

interface SpinVisualProps {
	isSpinning: boolean;
	isWaitingForFulfillment: boolean;
	isError: boolean;
}

export function SpinVisual({
	isSpinning,
	isWaitingForFulfillment,
	isError,
}: SpinVisualProps) {
	return (
		<div className="relative group">
			{/* Outer glow rings - decorative only */}
			<div
				aria-hidden="true"
				className={`absolute inset-0 w-52 h-52 sm:w-64 sm:h-64 rounded-full ${
					isWaitingForFulfillment || isSpinning ? "animate-pulse" : ""
				}`}
			>
				<div
					className="w-full h-full rounded-full border-2 border-warning/20 animate-spin"
					style={{ animationDuration: "8s" }}
				></div>
			</div>
			<div
				aria-hidden="true"
				className={`absolute inset-2 w-48 h-48 sm:w-60 sm:h-60 rounded-full ${
					isWaitingForFulfillment || isSpinning ? "animate-pulse" : ""
				}`}
			>
				<div
					className="w-full h-full rounded-full border border-warning/10 animate-spin"
					style={{
						animationDuration: "12s",
						animationDirection: "reverse",
					}}
				></div>
			</div>

			{/* Main spinner with enhanced state-based styling */}
			<div
				aria-hidden="true"
				className={cn(
					"relative w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-primary via-warning to-warning p-3 shadow-2xl shadow-warning/20",
					isWaitingForFulfillment || isSpinning
						? "spin-wobble"
						: isError
							? "border-danger/50 shadow-danger/20"
							: "shadow-gold-glow hover:shadow-3xl hover:shadow-warning/30 transition-all duration-300",
				)}
			>
				{/* Inner glass surface */}
				<div className="w-full h-full rounded-full bg-gradient-to-br from-background to-background/80 backdrop-blur-xl flex items-center justify-center border border-warning/40 relative overflow-hidden">
					{/* Shimmer effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]"></div>

					{/* Spin-Fi Logo */}
					<div className="relative z-10 filter drop-shadow-2xl">
						<svg
							className="w-20 h-20 drop-shadow-lg text-warning"
							viewBox="227 210 589 590"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Spin-Fi logo</title>
							<path
								d={LOGO_PATH_OUTER}
								fill="currentColor"
								transform="translate(489,210)"
							/>
							<path
								d={LOGO_PATH_INNER}
								fill="currentColor"
								transform="translate(480,318)"
							/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}
