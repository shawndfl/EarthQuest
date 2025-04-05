const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
      logging: 'log',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.resolve(__dirname, 'src/index.html'),
      chunks: ['debug', 'main'],
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets/levels/*.json', context: '.' },
        { from: 'assets/tiles/*', context: './' },
        { from: 'assets/sprites/*', context: './' },
      ],
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
        test: /\.(mp3)$/,
        use: ['url-loader'],
      },
      {
        test: /\.dat$/,
        exclude: /node_modules/,
        use: ['binary-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },
};
