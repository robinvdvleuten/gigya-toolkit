const cosmiconfig = require('cosmiconfig');
const yargs = require('yargs');
const pkg = require('../package.json');

module.exports = () => {
  const config = cosmiconfig('gigya', { sync: true });

  // eslint-disable-next-line no-unused-expressions
  yargs
    .commandDir('commands')
    .options({
      cwd: {
        description: 'A directory to use instead of $PWD'
      },
      prefix: {
        description: 'Prefix the identifier of the screenset'
      },
      'api-key': {
        description: 'Your Gigya API key',
        default: null,
      },
      secret: {
        description: 'Your Gigya secret',
        default: null,
      },
      region: {
        description: 'Your Gigya region',
        default: null,
      },
      config: {
        alias: 'c',
        description: 'Path to custom CLI config',
        default: null,
      }
    })
    .demandCommand()
    .config(config)
    .alias('settings', 's')
    .help('help')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .argv;
};
