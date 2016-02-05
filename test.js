const test = require('tape');
const runscriptsCli = require('./');

test('it work!', t => {
  const result = runscriptsCli();
  t.equal(result, 42);
  t.end();
});
