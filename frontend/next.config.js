/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: "export",
	trailingSlash: true,
	distDir: "dist",
	images: {
		unoptimized: true,
	},
	webpack: (config) => {
		config.externals.push("pino-pretty", "lokijs", "encoding");
		return config;
	},
	transpilePackages: ["@heroui/react", "@heroui/theme"],
};

module.exports = nextConfig;
