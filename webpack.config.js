const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    editor: './studio/editor.ts',
    welcome: './studio/welcome.ts',
    preferences: './studio/preferences.ts'
  },
  output: {
    path: path.resolve(__dirname, './app/dist'),
    publicPath: '/app/dist/',
    filename: '[name].bundle.js'
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        options: {
          esModule: true
        }
      },
      {
        test: /\.(css|less)$/i,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg|ttf|woff2?)$/i,
        use: 'url-loader?limit=8192&name=assets/[name].[ext]?[hash]'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    inline: true,
    hot: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new webpack.BannerPlugin('Copyright (c) 2017, Studio X')
  ])
}
