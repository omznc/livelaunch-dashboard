/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');
const nextConfig = {
	experimental: {},
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'juststephen.com',
				pathname: '/LiveLaunch/*/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.discordapp.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
		],
	},
	swcMinify: true,
};

module.exports = withAxiom(nextConfig);
