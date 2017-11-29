const reduce = require('p-reduce');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const requireFromString = require('require-from-string');
const invokeHook = require('./hooks');

function requireComponentForScreenSet(screenSetId, env) {
  const { code } = env.screenSets[screenSetId];
  const Component = requireFromString(code);

  return Component.default || Component;
}

function renderComponent(Component, styles, env) {
  const hook = invokeHook('render', env, ({ Component: C }) => ({
    markup: renderToStaticMarkup(createElement(C)),
    styles,
  }));

  return hook({ Component, styles }, env);
}

function renderScreenSets(env) {
  return reduce(Object.keys(env.screenSets), async (screenSets, screenSetId) => {
    const Component = requireComponentForScreenSet(screenSetId, env);
    const rendered = await renderComponent(Component, screenSets[screenSetId].styles, env);

    const screenSet = Object.assign(screenSets[screenSetId], {
      markup: rendered.markup,
      styles: rendered.styles
    });

    return Object.assign(screenSets, { [screenSetId]: screenSet });
  }, env.screenSets);
}

module.exports = async env => {
  await renderScreenSets(env);
};
