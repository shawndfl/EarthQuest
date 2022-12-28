const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './dist')
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Earth Quest',

      template:  path.resolve(__dirname, 'src/index.html')
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

 optimization: {

   runtimeChunk: 'single',

 },
 module: {
    rules: [
     
    ],
  },
};