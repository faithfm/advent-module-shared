// test/test.js

const assert = require('assert');
const core = require('../lib');

console.log('Starting Test...');


assert.strictEqual(core.version(), '1.0');
assert.strictEqual(core.info(), "Advent Services Shared Logic 1.0");

console.log('All tests passed!');