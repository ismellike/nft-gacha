import type { Variants } from "framer-motion";

// Stagger children animations
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 60 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

export const fadeInDown: Variants = {
	hidden: { opacity: 0, y: -60 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

export const fadeInLeft: Variants = {
	hidden: { opacity: 0, x: 60 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

export const fadeInRight: Variants = {
	hidden: { opacity: 0, x: -60 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.6,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

export const slideInFromBottom: Variants = {
	hidden: { y: 100, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.8,
			ease: [0.25, 0.4, 0.25, 1],
		},
	},
};

// Text reveal animation for headlines
export const textReveal: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: (i = 0) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.6,
			ease: [0.25, 0.4, 0.25, 1],
		},
	}),
};

// Card hover effects
export const cardHover = {
	rest: { scale: 1 },
	hover: {
		scale: 1.02,
		transition: {
			duration: 0.3,
			ease: "easeInOut",
		},
	},
};

// Pulse animation for attention-grabbing elements
export const pulse: Variants = {
	hidden: { scale: 1, opacity: 0.8 },
	visible: {
		scale: [1, 1.05, 1],
		opacity: [0.8, 1, 0.8],
		transition: {
			duration: 2,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

// Glow animation
export const glowPulse: Variants = {
	hidden: { boxShadow: "0 0 0px rgba(255, 191, 0, 0.3)" },
	visible: {
		boxShadow: [
			"0 0 20px rgba(255, 191, 0, 0.3)",
			"0 0 40px rgba(255, 191, 0, 0.5)",
			"0 0 20px rgba(255, 191, 0, 0.3)",
		],
		transition: {
			duration: 2,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

// Shimmer effect for cards
export const shimmer: Variants = {
	hidden: { backgroundPosition: "-1000px 0" },
	visible: {
		backgroundPosition: ["1000px 0", "-1000px 0"],
		transition: {
			duration: 20,
			repeat: Number.POSITIVE_INFINITY,
			ease: "linear",
		},
	},
};
