const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "production",
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'bundle/dist'),
    filename: 'api.bundle.js'
  },
  target: 'node',
  node: {
    __dirname: false
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/swagger-ui-dist/swagger-ui.css' },
        { from: 'node_modules/swagger-ui-dist/swagger-ui-bundle.js' },
        { from: 'node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js' },
        { from: 'node_modules/swagger-ui-dist/favicon-16x16.png' },
        { from: 'node_modules/swagger-ui-dist/favicon-32x32.png' },
		    { from: 'src/routers/*.js', to: path.resolve(__dirname, 'bundle') },
	    ]
    })
  ]
};