const DevServer = require('webpack-dev-server');
const MemoryFS = require('memory-fs');
const webpack = require('webpack');
const invokeHook = require('../hooks');
const { error, warn } = require('../util');
const createConfig = require('./config');
const WebpackConfigHelpers = require('./helpers');

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

  const hook = invokeHook('webpack', env);
  await hook(config, env, new WebpackConfigHelpers(env.cwd));

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
