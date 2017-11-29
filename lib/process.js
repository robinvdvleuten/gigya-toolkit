const { readdirSync } = require('fs');
const { basename, extname, resolve } = require('path');
const extractStack = require('extract-stack');
const _ = require('lodash');
const ora = require('ora');
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
    .filter(file => util.isFile(resolve(env.src, file)) && extname(file) === '.js');
}

function resolveEnvironment(argv) {
  const env = {
    prefix: argv.prefix,
    apiKey: argv.apiKey,
    secret: argv.secret,
    region: argv.region,
    template: argv.template,
    port: argv.port,
    host: argv.host
  };

  env.cwd = resolve(argv.cwd || process.cwd());
  env.src = resolve(env.cwd, argv.source);

  env.config = argv.config ? resolve(env.cwd, argv.config) : null;
  env.pkg = util.readJson(resolve(env.cwd, 'package.json')) || {};

  if (!util.isDir(env.src)) {
    util.error(`source directory "${env.src}" is not a directory\n`, 1);
  }

  const files = loadSourceFiles(env);
  env.screenSets = createScreenSets(files, env);

  return env;
}

exports.build = async argv => {
  const env = resolveEnvironment(argv);

  let spinner = ora('Initialize Webpack').start();

  try {
    await webpack(env);

    spinner = spinner.succeed().start('Render screen sets');
    await render(env);

    spinner = spinner.succeed().start('Synchronize with Gigya');
    await synchronize(env);

    spinner.succeed();
  } catch (err) {
    spinner.fail(err.message);
    process.stdout.write(`${extractStack(err)}\n`);
    process.exit(1);
  }
};

exports.develop = async argv => {
  const env = resolveEnvironment(argv);
  env.devServer = true;

  let spinner = ora('Initialize development server').start();

  try {
    await webpack(env);
    spinner = spinner.info(`Development server started: http://${env.host}:${env.port}`);
  } catch (err) {
    spinner.fail(err.message);
    process.stdout.write(`${extractStack(err)}\n`);
    process.exit(1);
  }
};
