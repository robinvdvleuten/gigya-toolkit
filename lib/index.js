const yargs = require('yargs');
const pkg = require('../package.json');
const process = require('./process');

module.exports = () => {
  const { argv } = yargs
    .usage('$0 [options] <source>')
    .options({})
    .help('help')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .require(1, 'Missing <source> argument');

  process(argv);
};
