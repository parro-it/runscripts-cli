#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const debug = require('debug')('runscripts-cli');
const runscripts = require('runscripts');
const chalk = require('chalk');
const co = require('co');
const dedent = require('dedent-js');
const abbrev = require('abbrev');
const mapToArray = require('./modules/map-to-array');

const argv = yargs.argv;
const command = argv._[0];

const ok = chalk.bold.green('✓');
const failure = chalk.bold.red('✘');
const writeErr = msg => process.stderr.write(`\n${msg}\n`);
const write = msg => process.stdout.write(`\n${msg}\n`);

function handleError(err) {

  if (err.code === 'EINVALIDPKG' || err.code === 'ENOSCRIPT' || err.code === 'ENOCONFIG') {
    writeErr(`${failure} ${chalk.bold.red(err.code)}: ${err.message}`);
    process.exit(-1);
  }

  writeErr(err.stack);
}

function getCommandsAbbreviation(scripts) {
  const scriptsKeys = Object.keys(scripts.object);
  return abbrev(scriptsKeys);
}

function shortenAbbrev(cmds, abbr) {
  debug('shortenAbbrev', cmds, abbr);
  if (
    !(abbr.value in cmds) ||
    cmds[abbr.value] > abbr.key.length
  ) {
    cmds[abbr.value] = abbr.key.length;
  }
  return cmds;
}

function abbrevScriptsNames(scripts) {

  const abbreviations = mapToArray(
    getCommandsAbbreviation(scripts),
    (key, value) => ({value, key})
  );

  debug('abbreviations', abbreviations);

  const commands = abbreviations.reduce(shortenAbbrev, {});

  const scriptsList = mapToArray(
    commands,
    (name, abbrLen) =>
      chalk.bold(name.slice(0, abbrLen)) +
      name.slice(abbrLen)
  );
  debug('scriptsList', scriptsList);

  return dedent`
    * ${scriptsList.join('\n * ')}
  `;
}

function usage(scripts) {
  write(dedent`
    Usage: runs <command-name> [...command-options]

    Available commands:
     ${abbrevScriptsNames(scripts)}
  `);
  process.exit(0);
}

function * run() {
  const scripts = yield runscripts.readScriptsObject();

  if (!command) {
    return usage(scripts);
  }

  const abbreviations = getCommandsAbbreviation(scripts);
  const commandName = chalk.bold.yellow(
    abbreviations[command] || command
  );

  write(`Executing ${commandName}…`);

  const proc = yield runscripts(command, argv);
  const exitCode = yield proc.exitPromise;

  if (exitCode) {
    return writeErr(`${failure} ${commandName} failed.`);
  }

  write(`${ok} ${commandName} done.`);
}

co(run).catch(handleError);
