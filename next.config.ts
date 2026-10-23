import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	reactCompiler: true,
	cacheComponents: true,
	partialPrefetching: true,
	experimental: {
		serverActions: {
			allowedOrigins: [
				...(process.env.NODE_ENV !== "production" ? ["localhost:3000"] : []),
				"livelaunch.juststephen.com",
			],
		},
		serverComponentsHmrCache: true,
		webpackMemoryOptimizations: true,
	},
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "juststephen.com",
				pathname: "/LiveLaunch/*/**",
			},
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/gaunter-o-dimm/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/gaunter-o-dimm/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
