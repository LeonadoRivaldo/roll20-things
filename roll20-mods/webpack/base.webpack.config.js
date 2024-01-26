const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	mode: 'production',
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		minimize: false,
		minimizer: [new TerserPlugin()],
	},
};
