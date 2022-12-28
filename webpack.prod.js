const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: { main: path.resolve(__dirname, './src/index.js') },
  mode: 'development',

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Earth Quest',
      template: path.resolve(__dirname, 'src/index.html'),
      chunks: ['main'],
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
