# gigya-toolkit

A CLI toolkit to create your [Gigya](https://www.gigya.com) screensets with [React](https://reactjs.org/).

[![NPM version](https://img.shields.io/npm/v/gigya-toolkit.svg)](https://www.npmjs.com/package/gigya-toolkit)
[![Build Status](https://travis-ci.org/robinvdvleuten/gigya-toolkit.svg?branch=master)](https://travis-ci.org/robinvdvleuten/gigya-toolkit)

## Installation

Install the package and its peer dependencies.

```bash
$ npm install --save gigya-toolkit react react-dom
```

## Usage

When you have defined a screen set (src/RegistrationLogin.js) like this;

```js
import React from 'react';

const Login = () =>
  <div id="login-screen" className="gigya-screen" data-caption="Login">
    {/* Login Screen Markup */}
  </div>;

const Registration = () =>
  <div id="registration-screen" className="gigya-screen" data-caption="Register">
    {/* Registration Screen Markup */}
  </div>;

export default () => (
  <div id="react-screen-set" className="gigya-screen-set" style={{ display: 'none' }}>
    <Login />
    <Registration />
  </div>
);
```

You can create the correct HTML markup and synchronize them with Gigya like this;

```bash
bin/gigya --api-key=<GIGYA API KEY> --secret=<GIGYA SECRET> --region=<GIGYA DATACENTER> src
```

## CLI Options

Create and synchronize your screensets.

```bash
bin/gigya [options] <source>

Options:
  --cwd          A directory to use instead of $PWD
  --prefix       Prefix the identifier of the screenset
  --api-key      Your Gigya API key                                    [string]
  --secret       Your Gigya secret                                     [string]
  --region       Your Gigya region                                     [string]
  --config, -c   Path to custom CLI config                             [string]
  --help, -h     Show help                                             [boolean]
  --version, -v  Show version number                                   [boolean]
```

## Custom Configuration

To customize the compilation process, create a `toolkit.config.js` file which exports multiple hooks that will be invoked on each compilation step.

```js
/**
 * Function that mutates webpack configuration.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - The webpack configuration.
 * @param {object} env - options passed to CLI.
 **/
exports.webpack = (config, env) => {
  /** you can change config here **/
}

/**
 * Function that renders the React component.
 * Supports asynchronous rendering when promise is returned.
 *
 * @param {object} config - The render configuration.
 * @param {object} env - options passed to CLI.
 **/
exports.render = ({ Component }, env) => {
  /** you can return a custom { markup, styles } object here **/
}
```

## License

MIT © [Robin van der Vleuten](https://www.robinvdvleuten.nl)
