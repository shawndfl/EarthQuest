const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './docs'),
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Earth Quest',

      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './docs'),
    clean: true,
  },

  optimization: {
    runtimeChunk: 'single',
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
