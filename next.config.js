/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');
const million = require('million/compiler');

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

module.exports = million.next(withAxiom(nextConfig), { auto: { rsc: true } });
