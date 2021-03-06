const { existsSync, readFileSync, statSync } = require('fs');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

exports.isDir = str =>
  existsSync(str) && statSync(str).isDirectory();

exports.isFile = str =>
  existsSync(str) && statSync(str).isFile();

exports.readJson = file => {
  try {
    return JSON.parse(readFileSync(file));
  } catch (err) {
    return null;
  }
};

exports.info = (text, code) => {
  process.stderr.write(`${logSymbols.info + chalk.blue(' INFO ') + text}\n`);
  return code && process.exit(code);
};

exports.success = (text, code) => {
  process.stderr.write(`${logSymbols.info + chalk.green(' SUCCESS ') + text}\n`);
  return code && process.exit(code);
};

exports.warn = (text, code) => {
  process.stdout.write(`${logSymbols.warning + chalk.yellow(' WARN ') + text}\n`);
  return code && process.exit(code);
};

exports.error = (text, code) => {
  process.stderr.write(`${logSymbols.error + chalk.red(' ERROR ') + text}\n`);
  return code && process.exit(code);
};
