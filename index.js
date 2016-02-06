#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const runscripts = require('runscripts');
const chalk = require('chalk');

const argv = yargs.argv;
const command = argv._[0];


const handleError = err => {

  if (err.code === 'EINVALIDPKG' || err.code === 'ENOSCRIPT' || err.code === 'ENOCONFIG') {
    process.stderr.write(`\n${chalk.bold.red(err.code)}: ${err.message}\n`);
    process.exit(-1);
  }

  process.stderr.write(`\n${err.stack}\n`);
};

const abbrev = require('abbrev');
const map = require('map-obj');

function abbrevScriptsNames(scripts) {
  const scriptsKeys = Object.keys(scripts.object);

  let idx = 0;
  const scriptsAbbrev = map(
    abbrev(scriptsKeys),
    (key, value) => [idx++, {value, key}]
  );
  scriptsAbbrev.length = idx;

  const abbreviations = Array.from(scriptsAbbrev);
  console.log('abbreviations', abbreviations);
  const commands = abbreviations.reduce((cmds, abbr) => {
    console.log(cmds, abbr)
    if (
      !(abbr.value in cmds) ||
      cmds[abbr.value] > abbr.key.length
    ) {
      cmds[abbr.value] = abbr.key.length;
    }
    return cmds;
  }, {});

  let idx2 = 0;
  const scriptsList = map(commands, (name, abbrLen) =>
    [idx2++, chalk.bold(name.slice(0, abbrLen)) +
    name.slice(abbrLen)]
  );
  console.log(scriptsList);
  scriptsList.length = idx2;

  return '\n * ' +
    Array.from(scriptsList)
      .join('\n * ') +
    '\n';
}

if (!command) {
  runscripts.readScriptsObject()
    .then(scripts => {
      process.stdout.write(`
Usage: runs <command-name> [...command-options]

Available commands:
${abbrevScriptsNames(scripts)}
`);
      process.exit(0);
    })
    .catch(handleError);

} else {

  process.stdout.write(`\nExecuting command ${chalk.bold.yellow(command)}.\n`);


  runscripts(command, argv)
    .then(() => process.stdout.write(`\nDone ${chalk.bold.yellow(command)}.\n`))
    .catch(handleError);

}
