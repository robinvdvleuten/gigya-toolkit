const { develop } = require('../process');

exports.command = 'develop [options] <source>';
exports.desc = 'Start a development server to develop your screensets locally';

exports.builder = {
  template: {
    description: 'Path to custom template file',
    default: null
  },
  port: {
    description: 'Port to start a server on',
    default: 3000
  },
  host: {
    description: 'Host to start a server on',
    default: 'localhost'
  }
};

exports.handler = develop;
