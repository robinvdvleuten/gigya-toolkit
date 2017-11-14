const { build } = require('../process');

exports.command = 'build [options] <source>';
exports.desc = 'Compile and synchronize your screensets with the configured Gigya account';

exports.handler = argv => {
  build(argv);
};
