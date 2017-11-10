const reduce = require('p-reduce');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const requireFromString = require('require-from-string');
const invokeHook = require('./hooks');

function requireComponentForScreenSet(screenSetId, env) {
  const { code } = env.screenSets[screenSetId];
  const Component = requireFromString(code.toString());

  return Component.default || Component;
}

function renderComponent(Component, env) {
  const hook = invokeHook('render', env, ({ Component: C }) => ({
    markup: renderToStaticMarkup(createElement(C))
  }));

  return hook({ Component }, env);
}

function renderScreenSets(env) {
  return reduce(Object.keys(env.screenSets), async (screenSets, screenSetId) => {
    const Component = requireComponentForScreenSet(screenSetId, env);
    const { markup, styles } = await renderComponent(Component, env);
    const screenSet = Object.assign(screenSets[screenSetId], { markup, styles });

    return Object.assign(screenSets, { [screenSetId]: screenSet });
  }, env.screenSets);
}

module.exports = async env => {
  await renderScreenSets(env);
};
