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

function resolveEnvironment(argv) {
  const env = {
    prefix: argv.prefix,
    apiKey: argv.apiKey,
    secret: argv.secret,
    region: argv.region,
    port: argv.port,
  };

  env.cwd = resolve(argv.cwd || process.cwd());
  env.src = resolve(env.cwd, argv.source);
  env.config = argv.config ? resolve(env.cwd, argv.config) : null;

  if (!util.isDir(env.src)) {
    util.error(`source directory "${env.src}" is not a directory\n`, 1);
  }

  const files = loadSourceFiles(env);
  env.screenSets = createScreenSets(files, env);

  return env;
}

exports.build = async argv => {
  const env = resolveEnvironment(argv);

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

exports.develop = async argv => {
  const env = resolveEnvironment(argv);
  env.devServer = true;

  try {
    await webpack(env);
  } catch (err) {
    util.error(err.message);
    process.stdout.write(`${extractStack(err)}\n`);
    process.exit(1);
  }
};
