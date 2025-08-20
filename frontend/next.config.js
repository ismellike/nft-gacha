import MillionLint from "@million/lint";
/** @type {import('next').NextConfig} */
const nextConfig = {
	// Performance optimizations
	reactStrictMode: true,

	// Build configuration
	output: "export",
	trailingSlash: true,
	distDir: "dist",
	poweredByHeader: false,

	// Image optimization
	images: {
		unoptimized: true,
		formats: ["image/webp", "image/avif"],
		// Allow external image domains
		domains: [
			"static.courtyard.io",
			"api.courtyard.io",
			"ipfs.io",
			"gateway.pinata.cloud",
			"cloudflare-ipfs.com",
			// Image proxy services
			"images.weserv.nl",
			"cors-anywhere.herokuapp.com",
		],
		// Remote patterns for more flexible domain matching
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.courtyard.io",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ipfs.io",
				port: "",
				pathname: "/ipfs/**",
			},
			{
				protocol: "https",
				hostname: "*.pinata.cloud",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.weserv.nl",
				port: "",
				pathname: "/**",
			},
		],
	},

	// Turbopack configuration for faster development
	turbopack: {
		resolveAlias: {
			"@": "./src",
			"@/components": "./src/components",
			"@/lib": "./src/lib",
			"@/hooks": "./src/hooks",
		},
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},

	// Latest experimental features
	experimental: {
		// React Compiler for automatic optimizations (Next.js 15+)
		// reactCompiler: true, // Disabled - requires babel-plugin-react-compiler

		// Optimize package imports for better tree shaking
		optimizePackageImports: [
			"@heroicons/react",
			"@heroui/react",
			"framer-motion",
			"zustand",
		],

		// Lightning CSS for faster CSS processing (disabled due to PostCSS plugin conflict)
		// useLightningcss: true,

		// Partial Prerendering for improved performance
		ppr: false, // Set to true if using app router with SSG
	},

	// Transpile packages for better compatibility
	transpilePackages: ["@heroui/react", "@heroui/theme"],

	// Compiler options (SWC is now default, no need to specify swcMinify)
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? {
						exclude: ["error", "warn"],
					}
				: false,
		// Remove React properties in production
		reactRemoveProperties: process.env.NODE_ENV === "production",
	},

	// Development server configuration (fixed deprecated options)
	devIndicators: {
		position: "bottom-right",
	},

	// Logging configuration
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default MillionLint.next({
	enabled: true,
	rsc: true,
})(nextConfig);
