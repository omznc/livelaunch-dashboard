/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'juststephen.com',
				pathname: '/LiveLaunch/agency_logo/**',
			},
		],
	},
};

module.exports = nextConfig;
