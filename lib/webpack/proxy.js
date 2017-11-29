/* eslint-disable no-param-reassign, no-underscore-dangle */
const requireRelative = require('require-relative');
const utils = require('loader-utils');

function swapOptions(loaderContext, newOptions) {
  const copy = Object.keys(newOptions).reduce((obj, key) =>
    Object.assign(obj, { [key]: newOptions[key] }), {});

  // Delete all existing loader options
  delete loaderContext.query.options;
  delete loaderContext.query.loader;
  delete loaderContext.query.cwd;

  // Add new options
  Object.keys(copy).reduce((obj, key) => {
    obj[key] = copy[key];
    return obj;
  }, loaderContext);
}

function proxyLoader(source, map) {
  const options = utils.getOptions(this);

  // First run proxy-loader run
  if (!this.query.__proxy_loader__) {
    // Store passed options for future calls to proxy-loader with same loaderContext (this)
    // e.g. calls via 'this.addDependency' from actual loader
    this.query.__proxy_loader__ = { loader: options.loader, cwd: options.cwd };

    // Remove proxy-loader options and make this.query act as requested loader query
    swapOptions(this, options.options);
  }

  const proxyOptions = this.query.__proxy_loader__;
  let loader;

  try {
    loader = requireRelative(proxyOptions.loader, proxyOptions.cwd);
  } catch (e) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    loader = require(proxyOptions.loader);
  }

  // Run actual loader
  return loader.call(this, source, map);
}

module.exports = proxyLoader;
