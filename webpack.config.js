const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')

module.exports = (env) => {
  return {
    mode: env.production ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist')
    },
    devServer: {
      port: 3000,
      open: true,
      overlay: true
    },
    devtool: 'source-map',
    resolve: {
      modules: [path.resolve(__dirname, 'source'), path.resolve(__dirname, 'node_modules')]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html')
      }),
      new CleanWebpackPlugin()
    ]
  }
}
