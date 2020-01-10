const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
	target: 'web',
	mode: 'development',
	entry: ['./src/main.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			}
		]
	},
	plugins: [
		new VueLoaderPlugin()
	],
	resolve: {
		alias: {
			vue: 'vue/dist/vue.min.js'
		}
	}
}
