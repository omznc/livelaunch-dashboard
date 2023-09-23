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
				pathname: '/LiveLaunch/*/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.discordapp.com',
			},
		],
	},
	// swcMinify: true,
	// webpack: (config, { dev, isServer }) => {
	// 	if (!isServer) {
	// 		Object.assign(config.resolve.alias, {
	// 			'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
	// 			react: 'preact/compat',
	// 			'react-dom/test-utils': 'preact/test-utils',
	// 			'react-dom': 'preact/compat',
	// 		});
	// 	}
	// 	return config;
	// },
};

module.exports = nextConfig;
