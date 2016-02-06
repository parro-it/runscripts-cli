const test = require('tape');
const runscripts = require('runscripts');
const co = require('co');
const concat = require('stream-string');

test('it work!', co.wrap(function * (t) {
  const data = yield runscripts('test_fixture', {}, {
    spawn: {
      stdio: [0, 'pipe', 2]
    }
  });
  const result = yield concat(data.stdout);
  t.equal(result, 'fixture\n');
  t.end();
}));
