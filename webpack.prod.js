const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    debug: './src/utilities/webgl-debug.js',
    main: { import: './src/index.js', dependOn: 'debug' },
  },
  mode: 'development',

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Earth Quest',
      template: path.resolve(__dirname, 'src/index.html'),
      chunks: ['debug', 'main'],
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './docs'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
