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

  //process.stderr.write(`\n${err.stack}\n`);
};

if (!command) {
  runscripts.readScriptsObject()
    .then(scripts => {
      process.stdout.write(`
Usage: runs <command-name> [...command-options]

Available commands:
${
  '\n * ' +
  Object.keys(scripts.object)
  .join('\n * ')
}
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
