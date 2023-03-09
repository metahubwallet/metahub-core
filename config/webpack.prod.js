const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const {cssLoaders, htmlPage} = require('./tools')
const {styleLoaders} = require('./tools')
module.exports = merge(baseWebpack, {
  devtool: '#cheap-module-source-map',
  module: {
    rules: styleLoaders({ extract: true, sourceMap: true })
  },
  plugins: [
    // htmlPage('Metahub', 'popup', ['manifest', 'vendor', 'popup']),
    // htmlPage('Metahub', 'window', ['manifest', 'vendor', 'window']),
    // htmlPage('Metahub', 'background', ['manifest', 'vendor', 'background']),

    new CleanWebpackPlugin(['build/*.*']),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: false
      }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new UglifyJSPlugin({
      uglifyOptions: {
        mangle: true,
        compress: {
          drop_console: true
        }
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module) {
    //     return (
    //       module.resource &&
    //       /\.js$/.test(module.resource) &&
    //       module.resource.indexOf(
    //         path.join(__dirname, '../node_modules')
    //       ) === 0
    //     )
    //   }
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   chunks: ['vendor']
    // })
  ]
})
