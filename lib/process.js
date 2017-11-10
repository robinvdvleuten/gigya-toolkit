const { readdirSync } = require('fs');
const { basename, extname, resolve } = require('path');
const extractStack = require('extract-stack');
const _ = require('lodash');
const render = require('./render');
const synchronize = require('./gigya');
const webpack = require('./webpack');
const util = require('./util');

function generateScreenSetIdentifier(file, env) {
  return _.compact([ env.prefix, basename(file, extname(file)) ]).join('-');
}

function createScreenSets(files, env) {
  return _.fromPairs(files.map(file => [ generateScreenSetIdentifier(file, env), { file: `./${file}` }]));
}

function loadSourceFiles(env) {
  return readdirSync(env.src)
    .filter(file => util.isFile(resolve(env.src, file)));
}

module.exports = async argv => {
  const env = {
    prefix: argv.prefix, apiKey: argv.apiKey, secret: argv.secret, region: argv.region
  };

  env.cwd = resolve(argv.cwd || process.cwd());
  env.src = resolve(env.cwd, argv._[0]);
  env.config = argv.config ? resolve(env.cwd, argv.config) : null;

  if (!util.isDir(env.src)) {
    util.error(`source directory "${env.src}" is not a directory\n`, 1);
  }

  const files = loadSourceFiles(env);
  env.screenSets = createScreenSets(files, env);

  try {
    await webpack(env);
    await render(env);
    await synchronize(env);
  } catch (err) {
    util.error(err.message);
    process.stdout.write(`${extractStack(err)}\n`);
    process.exit(1);
  }

  util.success('Synchronization finished');
};
