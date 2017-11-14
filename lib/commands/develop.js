const { develop } = require('../process');

exports.command = 'develop [options] <source>';
exports.desc = 'Start a development server to develop your screensets locally';

exports.builder = {
  port: {
    description: 'Port to start a server on',
    default: 3000
  },
  host: {
    description: 'Host to start a server on',
    default: 'localhost'
  }
};

exports.handler = argv => {
  develop(argv);
};
