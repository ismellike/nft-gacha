const nextConfig = {
	// Performance optimizations
	reactStrictMode: true,

	// Build configuration for SPA
	output: "export",
	trailingSlash: true,
	distDir: "dist",
	poweredByHeader: false,

	// Disable server-side features for true SPA
	skipTrailingSlashRedirect: true,

	// Exclude API routes from static export
	excludeDefaultMomentLocales: true,

	// Image optimization
	images: {
		unoptimized: true,
		formats: ["image/webp", "image/avif"],
		// Remote patterns for external image domains
		remotePatterns: [
			// Courtyard domains - allow all subdomains and paths
			{
				protocol: "https",
				hostname: "*.courtyard.io",
				port: "",
				pathname: "/**",
			},
			// IPFS and decentralized storage
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
		optimizePackageImports: ["@heroicons/react", "framer-motion", "zustand"],

		// Lightning CSS for faster CSS processing (disabled due to PostCSS plugin conflict)
		// useLightningcss: true,

		// Partial Prerendering for improved performance
		ppr: false, // Set to true if using app router with SSG
	},

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

export default nextConfig;
