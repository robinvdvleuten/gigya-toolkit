const path = require('path');

/**
 * Wrapper around webpack's [loader entry](https://webpack.js.org/configuration/module/#useentry).
 *
 * @typedef {object} LoaderWrapper
 * @property {object} rule - [rule entry](https://webpack.js.org/configuration/module/#module-rules).
 * @property {number} ruleIndex - index of rule in config.
 * @property {object} loader - [loader entry](https://webpack.js.org/configuration/module/#useentry).
 * @property {number} loaderIndex - index of loader in rule.
 */

/**
 * Wrapper around webpack's [rule](https://webpack.js.org/configuration/module/#module-rules).
 *
 * @typedef {object} RuleWrapper
 * @property {object} rule - [rule entry](https://webpack.js.org/configuration/module/#module-rules).
 * @property {number} index - index of rule in config.
 */

/**
 * Wrapper around webpack's [plugin](https://webpack.js.org/configuration/plugins/#plugins).
 *
 * @typedef {object} PluginWrapper
 * @property {object} plugin - [plugin entry](https://webpack.js.org/configuration/plugins/#plugins).
 * @property {number} index - index of plugin in config.
 */

// eslint-disable-next-line func-names
module.exports = function (cwd) {
  /**
   * Returns wrapper around all rules from config.
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @returns {RuleWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getRules = config =>
    [ ...(config.module.loaders || []), ...(config.module.rules || []) ]
      .map((rule, index) => ({ index, rule }));

  /**
   * Returns wrapper around all loaders from config.
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @returns {LoaderWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getLoaders = config =>
    this.getRules(config).map(({ rule, index }) => ({
      rule,
      ruleIndex: index,
      loaders: (rule.loaders || rule.use || rule.loader)
    }));

  /**
   * Returns wrapper around all plugins from config.
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @returns {PluginWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getPlugins = config =>
    (config.plugins || []).map((plugin, index) => ({ index, plugin }));

  /**
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @param {string} file - path to test against loader. Resolved relatively to $PWD.
   * @returns {RuleWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getRulesByMatchingFile = (config, file) => {
    const filePath = path.resolve(cwd, file);

    return this.getRules(config)
      .filter(w => w.rule.test && w.rule.test.exec(filePath));
  };

  /**
   * Returns loaders that match provided name.
   *
   * @example
   * helpers.getLoadersByName(config, 'less-loader')
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @param {string} name - name of loader.
   * @returns {LoaderWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getLoadersByName = (config, name) =>
    this.getLoaders(config)
      // eslint-disable-next-line no-confusing-arrow
      .map(({ rule, ruleIndex, loaders }) => Array.isArray(loaders)
        ? loaders.map((loader, loaderIndex) => ({
          rule, ruleIndex, loader, loaderIndex
        }))
        : [{
          rule, ruleIndex, loader: loaders, loaderIndex: -1
        }])
      .reduce((arr, loaders) => arr.concat(loaders), [])
      .filter(({ loader }) => loader === name || (loader && loader.loader === name));

  /**
   * Returns plugins that match provided name.
   *
   * @example
   * helpers.getPluginsByName(config, 'HtmlWebpackPlugin')
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @param {string} name - name of loader.
   * @returns {PluginWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getPluginsByName = (config, name) =>
    this.getPlugins(config)
      .filter(w => w.plugin && w.plugin.constructor && w.plugin.constructor.name === name);

  /**
   * Returns plugins that match provided type.
   *
   * @example
   * helpers.getPluginsByType(config, webpack.optimize.CommonsChunkPlugin)
   *
   * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
   * @param {any} type - type of plugin.
   * @returns {PluginWrapper[]}
   *
   * @memberof WebpackConfigHelpers
   */
  this.getPluginsByType = (config, type) =>
    this.getPlugins(config)
      .filter(w => w.plugin instanceof type);
};
