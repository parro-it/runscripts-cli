'use strict';

const yargs = require('yargs');
const runscripts = require('runscripts');

const argv = yargs.argv;
console.log(argv);

runscripts(argv._[0], argv).catch(err => {
  console.log(err.stack);
});
