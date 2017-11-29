const DevServer = require('webpack-dev-server');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const MemoryFS = require('memory-fs');
const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const createBabelConfig = require('./babel');
const invokeHook = require('./hooks');
const { readJson, error, warn } = require('./util');

function getEntryForScreenSet(screenSetId, env) {
  return {
    [screenSetId]: env.screenSets[screenSetId].file,
  };
}

function createConfig(env) {
  const babelrc = readJson(path.resolve(env.cwd, '.babelrc')) || {};
  const entry = env.devServer ? { client: path.resolve(__dirname, 'resources/entry.js') } : {};

  const template = env.template ? path.resolve(env.cwd, env.template) : path.resolve(__dirname, 'resources/template.html');
  const browsers = env.pkg.browserslist || [ '> 1%', 'last 2 versions', 'IE >= 9' ];

  const nodeModules = path.resolve(env.cwd, 'node_modules');

  return {
    context: env.src,

    entry: Object.keys(env.screenSets).reduce((entries, screenSetId) =>
      Object.assign(entries, getEntryForScreenSet(screenSetId, env)), entry),

    output: {
      path: '/screenSets',
      library: [ 'screenSets', '[name]' ],
      // Make sure that we can require the output as string when compiling.
      libraryTarget: env.devServer ? 'var' : 'commonjs2',
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: Object.assign(
            createBabelConfig(env),
            babelrc // intentionally overwrite our settings
          )
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
        defer: 'client.js',
      }),
    ],

    stats: 'errors-only',

    devServer: {
      contentBase: '/',
      compress: true,
      noInfo: true,
      port: env.port,
    }
  };
}

/**
 * Removes all loaders from any resource identifiers found in a string
 */
function stripLoaderPrefix(str) {
  if (typeof str === 'string') {
    return str.replace(/(^|\b|@)(\.\/~|\.{0,2}\/[^\s]+\/node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g, '');
  }

  return str;
}

function showStats(stats) {
  const info = stats.toJson('errors-only');

  if (stats.hasErrors()) {
    info.errors.map(stripLoaderPrefix).forEach(msg => error(msg));
  }

  if (stats.hasWarnings()) {
    info.warnings.map(stripLoaderPrefix).forEach(msg => warn(msg));
  }

  return stats;
}

function runCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        showStats(stats);
        reject(new Error('Compile failed'));
      }

      resolve(stats);
    });
  });
}

function retrieveEntryContents(fs, env) {
  Object.keys(env.screenSets).reduce((screenSets, screenSetId) => {
    const code = fs.readFileSync(`/screenSets/${screenSetId}.js`).toString();
    const styles = fs.readFileSync(`/screenSets/${screenSetId}.css`).toString();

    const screenSet = Object.assign(screenSets[screenSetId], { code, styles });

    return Object.assign(screenSets, { [screenSetId]: screenSet });
  }, env.screenSets);
}

module.exports = async env => {
  const config = createConfig(env);
  const fs = new MemoryFS();

  await invokeHook('webpack', env)(config, env);

  const compiler = webpack(config);
  compiler.outputFileSystem = fs;

  if (env.devServer) {
    await new Promise((resolve, reject) => {
      new DevServer(compiler, config.devServer).listen(env.port, env.host, err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }

  await runCompiler(compiler);
  retrieveEntryContents(fs, env);
};
