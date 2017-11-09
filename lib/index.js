const yargs = require('yargs');
const pkg = require('../package.json');
const process = require('./process');

module.exports = () => {
  const { argv } = yargs
    .usage('$0 [options] <source>')
    .options({
      cwd: {
        description: 'A directory to use instead of $PWD'
      },
      prefix: {
        description: 'Prefix the identifier of the screenset'
      },
      'api-key': {
        description: 'Your Gigya API key'
      },
      secret: {
        description: 'Your Gigya secret'
      },
      region: {
        description: 'Your Gigya region'
      }
    })
    .help('help')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .require(1, 'Missing <source> argument');

  process(argv);
};
