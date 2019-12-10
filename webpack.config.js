const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//const modeConfig = env => require(`./build-utils/webpack.${env.mode}.js`)(env);
const loadPresets = require('./build-utils/loadPresets');

const webcomponentsjs = './node_modules/@webcomponents/webcomponentsjs';

const polyfills = [
	{
		from: resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
		to: 'vendor',
		flatten: true
	},
	{
		from: resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
		to: 'vendor/bundles',
		flatten: true
	},
	{
		from: resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
		to: 'vendor',
		flatten: true
	}
];

// const assets = [
// 	{
// 		from: 'src/img',
// 		to: 'img/'
// 	}
// ];

const plugins = [
	new CleanWebpackPlugin(['dist']),
	new webpack.ProgressPlugin(),
	new HtmlWebpackPlugin({
		filename: 'index.html',
		template: './src/index.html',
		minify: {
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: true
		},
		title: 'Caching'
	}),
	new CopyWebpackPlugin([...polyfills], ['src/sw.js'], {
		ignore: ['.DS_Store']
	}),
	new MiniCssExtractPlugin()
];

module.exports = ({ mode, presets }) => {
	return webpackMerge(
		{
			mode,
			output: {
				filename: 'lit-tags.js'
			},
			resolve: {
				alias: {
					LitResolver: resolve(__dirname, 'node_modules/')
				}
			},
			module: {
				rules: [
					{
						test: /\.css|\.s(c|a)ss$/,
						use: [
							{
								loader: 'lit-scss-loader'
							},
							'extract-loader',
							'css-loader?url=false',
							'sass-loader'
						]
					},
					{
						test: /\.js$/,
						exclude: /node_modules/,
						loader: 'babel-loader',
						options: {
							plugins: ['@babel/plugin-syntax-dynamic-import'],
							presets: [
								[
									'@babel/preset-env',
									{
										useBuiltIns: 'usage',
										targets: '>1%, not dead, not ie 11'
									}
								]
							]
						}
					}
				]
			},
			devtool: 'source-map',
			plugins
		},
		//modeConfig({ mode, presets }),
		loadPresets({ mode, presets })
	);
};
