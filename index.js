#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const debug = require('debug')('runscripts-cli');
const runscripts = require('runscripts');
const chalk = require('chalk');
const dedent = require('dedent-js');
const abbrev = require('abbrev');
const mapToArray = require('./modules/map-to-array');

const argv = yargs.argv;
const command = argv._[0];


const handleError = err => {

  if (err.code === 'EINVALIDPKG' || err.code === 'ENOSCRIPT' || err.code === 'ENOCONFIG') {
    process.stderr.write(`\n${chalk.bold.red('✘ ' + err.code)}: ${err.message}\n`);
    process.exit(-1);
  }

  process.stderr.write(`\n${err.stack}\n`);
};

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

if (!command) {
  runscripts.readScriptsObject()
    .then(scripts => {
      process.stdout.write(dedent`

        Usage: runs <command-name> [...command-options]

        Available commands:
         ${abbrevScriptsNames(scripts)}

        `);
      process.exit(0);
    })
    .catch(handleError);

} else {
  runscripts.readScriptsObject()
    .then(scripts => {
      const abbreviations = getCommandsAbbreviation(scripts);
      const commandName = abbreviations[command] || command;
      process.stdout.write(`\nExecuting command ${chalk.bold.yellow(commandName)}…\n`);

      runscripts(command, argv)
        .then(proc => proc.exitPromise)
        .then(() => process.stdout.write(`\n${chalk.bold.green('✓')} Done ${chalk.bold.yellow(commandName)}.\n`))
        .catch(handleError);
    });
}
