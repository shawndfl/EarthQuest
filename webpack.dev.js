const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    debug: './src/utilities/webgl-debug.js',
    main: { import: './src/index.ts', dependOn: 'debug' },
  },
  mode: 'development',
  resolve: { extensions: ['.ts', '.js'] },
  devtool: 'inline-source-map',

  devServer: {
    static: path.join(__dirname, './docs'),
    compress: true,
    port: 8080,
    client: {
      logging: 'log'
    }
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
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.mp3$/,
        use: ["url-loader"]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
    ],
  },
};
