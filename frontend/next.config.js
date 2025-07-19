/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config) => {
		config.externals.push("pino-pretty", "lokijs", "encoding");
		return config;
	},
	transpilePackages: ["@heroui/react", "@heroui/theme"],
};

module.exports = nextConfig;
