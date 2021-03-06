const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const path = require('path');
const autoprefixer = require('autoprefixer');
const { readJson } = require('../util');

function getEntryForScreenSet(screenSetId, env) {
  return {
    [screenSetId]: env.screenSets[screenSetId].file,
  };
}

module.exports = env => {
  const babelrc = readJson(path.resolve(env.cwd, '.babelrc')) || {};
  const entry = env.devServer ? { client: path.resolve(__dirname, '../resources/entry.js') } : {};

  const template = env.template ? path.resolve(env.cwd, env.template) : path.resolve(__dirname, '../resources/template.html');
  const browsers = env.pkg.browserslist || [ '> 0.25%' ];

  const nodeModules = path.resolve(env.cwd, 'node_modules');

  return {
    context: env.src,
    mode: env.isProd ? 'production' : 'development',

    entry: Object.keys(env.screenSets).reduce((entries, screenSetId) =>
      Object.assign(entries, getEntryForScreenSet(screenSetId, env)), entry),

    output: {
      path: '/screenSets',
      library: [ 'screenSets', '[name]' ],
      // Make sure that we can require the output as string when compiling.
      libraryTarget: env.devServer ? 'var' : 'commonjs2',
    },

    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, '../node_modules')
      ],
    },

    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        nodeModules
      ],
      alias: {
        'proxy-loader': require.resolve('./proxy')
      }
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules\/(?!gigya-toolkit)/,
          use: {
            loader: require.resolve('babel-loader'),
            options: Object.assign(
              { presets: [ require.resolve('../babel') ], babelrc: false },
              // Intentionally overwrite our settings
              env.babelrc ? babelrc : {}
            )
          }
        },

        { // LESS
          enforce: 'pre',
          test: /\.less$/,
          use: [
            {
              loader: 'proxy-loader',
              options: {
                cwd: env.cwd,
                loader: 'less-loader',
                options: {
                  paths: [ nodeModules ]
                }
              }
            }
          ]
        },

        { // SASS
          enforce: 'pre',
          test: /\.s[ac]ss$/,
          use: [
            {
              loader: 'proxy-loader',
              options: {
                cwd: env.cwd,
                loader: 'sass-loader',
                options: {
                  includePaths: [ nodeModules ]
                }
              }
            }
          ]
        },

        { // STYLUS
          enforce: 'pre',
          test: /\.styl$/,
          use: [
            {
              loader: 'proxy-loader',
              options: {
                cwd: env.cwd,
                loader: 'stylus-loader',
                options: {
                  paths: [ nodeModules ]
                }
              }
            }
          ]
        },

        {
          test: /\.(css|less|s[ac]ss|styl)$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: [ autoprefixer({ browsers }) ]
                }
              }
            ]
          })
        },

        {
          test: /\.svg(\?.*)?$/,
          loader: 'url-loader'
        }
      ]
    },

    plugins: [
      new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: true
      }),

      new HtmlWebpackPlugin({
        template: `!!ejs-loader!${template}`,
        gigya: { apiKey: env.apiKey },
      }),

      new ScriptExtHtmlWebpackPlugin({
        defer: 'client.js'
      }),
    ],

    stats: 'errors-only',

    devtool: '#cheap-module-source-map',

    devServer: {
      contentBase: '/',
      compress: true,
      noInfo: true,
      port: env.port,
    }
  };
};
