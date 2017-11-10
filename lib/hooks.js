const { resolve } = require('path');
const { isFile } = require('./util');

function requireConfigFile(env) {
  const configFile = resolve(env.cwd, env.config || 'toolkit.config.js');

  if (!isFile(configFile)) {
    if (env.config) {
      throw new Error(`custom config "${env.config}" could not be loaded`);
    }

    return {};
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(configFile);
}

module.exports = (hook, env, defaultFunc) => {
  const config = requireConfigFile(env);

  return config[hook] || defaultFunc || (() => {});
};
