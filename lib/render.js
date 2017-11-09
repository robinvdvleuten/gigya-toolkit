const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const requireFromString = require('require-from-string');

function requireComponentForScreenSet(screenSetId, env) {
  const { code } = env.screenSets[screenSetId];
  const Component = requireFromString(code.toString());

  return Component;
}

function renderComponent(Component) {
  return renderToStaticMarkup(createElement(Component));
}

function renderScreenSets(env) {
  Object.keys(env.screenSets).reduce((screenSets, screenSetId) => {
    const Component = requireComponentForScreenSet(screenSetId, env);
    const markup = renderComponent(Component);
    const screenSet = Object.assign(screenSets[screenSetId], { markup });

    return Object.assign(screenSets, { [screenSetId]: screenSet });
  }, env.screenSets);
}

module.exports = env => {
  renderScreenSets(env);
};
