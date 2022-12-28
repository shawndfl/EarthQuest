const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    debug: './src/utilities/webgl-debug.js',
    main: { import: './src/index.js', dependOn: 'debug' },
  },
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    static: path.join(__dirname, './docs'),
    compress: true,
    port: 8080,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.resolve(__dirname, 'src/index.html'),
      chunks: ['debug', 'main'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
    ],
  },
};
