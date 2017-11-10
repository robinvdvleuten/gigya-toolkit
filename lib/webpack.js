const MemoryFS = require('memory-fs');
const path = require('path');
const webpack = require('webpack');
const createBabelConfig = require('./babel');
const invokeHook = require('./hooks');
const { readJson, error, warn } = require('./util');

function getEntryForScreenSet(screenSetId, env) {
  return { [screenSetId]: env.screenSets[screenSetId].file };
}

function createConfig(env) {
  const babelrc = readJson(path.resolve(env.cwd, '.babelrc')) || {};

  return {
    context: env.src,
    entry: Object.keys(env.screenSets).reduce((entries, screenSetId) =>
      Object.assign(entries, getEntryForScreenSet(screenSetId, env)), {}),
    output: {
      path: '/',
      // Make sure that we can require the output as string.
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          options: Object.assign(
            createBabelConfig(env),
            babelrc // intentionally overwrite our settings
          )
        }
      ]
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
    const code = fs.readFileSync(`/${screenSetId}.js`);
    const screenSet = Object.assign(screenSets[screenSetId], { code });

    return Object.assign(screenSets, { [screenSetId]: screenSet });
  }, env.screenSets);
}

module.exports = async env => {
  const config = createConfig(env);
  const fs = new MemoryFS();

  await invokeHook('webpack', env)(config, env);

  const compiler = webpack(config);
  compiler.outputFileSystem = fs;

  await runCompiler(compiler);
  retrieveEntryContents(fs, env);
};
