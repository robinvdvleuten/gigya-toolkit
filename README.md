# gigya-toolkit

A CLI toolkit to create your [Gigya](https://www.gigya.com) screensets with [React](https://reactjs.org/).

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

## Command-line Options

Create and synchronize your screensets.

```bash
bin/gigya [options] <source>

Options:
  --cwd          A directory to use instead of $PWD
  --prefix       Prefix the identifier of the screenset
  --api-key      Your Gigya API key                                    [string]
  --secret       Your Gigya secret                                     [string]
  --region       Your Gigya region                                     [string]
  --help, -h     Show help                                             [boolean]
  --version, -v  Show version number                                   [boolean]
```

## License

MIT © [Robin van der Vleuten](https://www.robinvdvleuten.nl)
