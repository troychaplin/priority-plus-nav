// Import the original config from the @wordpress/scripts package.
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

// Add any a new entry point by extending the webpack config.
module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'priority-plus-nav': './src/priority-plus-nav.js',
		'priority-editor': './src/priority-editor.js',
	},
	output: {
		...defaultConfig.output,
	},
};
