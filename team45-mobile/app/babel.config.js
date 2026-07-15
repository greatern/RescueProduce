module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			[
				"babel-preset-expo",
				{
					lazyImports: true,
					native: {
						unstable_transformProfile: "hermes-stable",
					},
				},
			],
		],
		plugins: [
			[
				"module:react-native-dotenv",
				{
					moduleName: "@env",
					path: ".env",
					safe: false,
					allowUndefined: true,
				},
			],
			"react-native-reanimated/plugin", // Add this line - MUST be last
		],
	};
};
