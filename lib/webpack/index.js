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
  if (!stats) {
    return;
  }

  const info = stats.toJson('errors-only');

  if (stats.hasErrors()) {
    info.errors.map(stripLoaderPrefix).forEach(msg => error(msg));
  }

  if (stats.hasWarnings()) {
    info.warnings.map(stripLoaderPrefix).forEach(msg => warn(msg));
  }
}

function runCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        showStats(stats);
        reject(new Error(`Compile failed: ${err.message}`));
      }

      resolve(stats);
    });
  });
}

function retrieveEntryContents(fs, env) {
  Object.keys(env.screenSets).reduce((screenSets, screenSetId) => {
    const contents = Object.entries({ code: 'js', styles: 'css' }).reduce((content, [ key, ext ]) => {
      const filePath = `/screenSets/${screenSetId}.${ext}`;
      const fileExists = fs.existsSync(filePath);

      return Object.assign(content, {
        [key]: fileExists ? fs.readFileSync(filePath).toString() : '',
      });
    }, {});

    if (!contents.code) {
      throw new Error(`Unable to read file "screenSets/${screenSetId}.js" while retrieving entry contents`);
    }

    return Object.assign(screenSets, {
      [screenSetId]: Object.assign(screenSets[screenSetId], contents),
    });
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
