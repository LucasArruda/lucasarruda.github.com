const path = require('path')
const { globSync } = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin')

const content = require('./src/data')

const SRC = path.resolve(__dirname, 'src')
const NODE_ENV = process.env.NODE_ENV || 'production'
const isDev = () => NODE_ENV === 'development'

const htmlPlugin = (inputTemplatePath, outputFileName, chunkPattern) => {
  return new HtmlWebpackPlugin({
    filename: outputFileName,
    inject: true,
    template: path.join(__dirname, inputTemplatePath),
    chunks: [chunkPattern],
    templateParameters: { content },
    minify: isDev() ? false : {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      removeComments: true,
      removeEmptyAttributes: true
    }
  })
}

const plugins = [
  htmlPlugin('src/index.ejs', 'index.html', 'dracula'),
  htmlPlugin('src/light.ejs', 'light.html', 'light'),
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css'
  }),
  new PurgeCSSPlugin({
    paths: globSync(`${SRC}/**/*`, { nodir: true }),
    safelist: ['html', 'body']
  }),
  new CompressionPlugin({
    algorithm: 'gzip'
  })
]

module.exports = {
  entry: {
    dracula: './src/dracula-entry.js',
    light: './src/light-entry.js'
  },
  output: {
    path: isDev() ? path.resolve(__dirname) : path.resolve(__dirname, 'dist'),
    publicPath: isDev() ? '/' : '',
    filename: isDev() ? '[name].js' : '[name].[contenthash].js',
    clean: !isDev()
  },
  mode: isDev() ? 'development' : 'production',
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': SRC
    }
  },
  devServer: {
    historyApiFallback: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins
}
