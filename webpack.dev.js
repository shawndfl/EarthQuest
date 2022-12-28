const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './dist')
  },
  devtool: 'inline-source-map',

  devServer: {
        
    static: path.join(__dirname, './dist'),
    compress: true,
    port: 8080,

  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',

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