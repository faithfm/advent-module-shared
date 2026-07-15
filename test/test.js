// test/test.js — plain-assert tests for the logging sanitize pass.
// All PII values below are dummy/example data, never real customer values.

const assert = require('assert');
const core = require('../lib');
const { sanitizeLog, maskGraphQLStrings } = require('../lib/logger.logic');
const Obfuscate = require('../lib/obfuscate.logic');

console.log('Starting Test...');

// --- Error flatten (#1): name/message/stack survive, extra props scrubbed ----
{
  const err = new Error('boom');
  err.code = 'E_TEST';
  err.mobile = '+61412345678';
  const out = sanitizeLog({ err });
  assert.strictEqual(out.err.name, 'Error');
  assert.strictEqual(out.err.message, 'boom');
  assert.ok(typeof out.err.stack === 'string' && out.err.stack.includes('boom'));
  assert.strictEqual(out.err.code, 'E_TEST');
  assert.strictEqual(out.err.mobile, Obfuscate.mobile('+61412345678'));
  assert.strictEqual(err.mobile, '+61412345678', 'original error must not be mutated');
}

// --- Error cause chain (#1) --------------------------------------------------
{
  const inner = new Error('inner-cause');
  const outer = new Error('outer', { cause: inner });
  const out = sanitizeLog({ err: outer });
  assert.strictEqual(out.err.message, 'outer');
  assert.strictEqual(out.err.cause.message, 'inner-cause');
  assert.ok(typeof out.err.cause.stack === 'string');
}

// --- AxiosError summary (#2): no headers/data, masked url --------------------
{
  const err = new Error('Request failed with status code 401');
  err.isAxiosError = true;
  err.code = 'ERR_BAD_REQUEST';
  err.config = {
    method: 'post',
    url: 'https://api.example.com/hook?token=dummy-secret-token',
    headers: { 'advent-services-token': 'dummy-header-secret', authorization: 'Bearer dummy' },
    data: '{"mobile":"+61412345678"}',
  };
  err.response = { status: 401, data: { error: 'unauthorized', otp: '123456' } };
  err.toJSON = () => ({ config: err.config });
  const out = sanitizeLog({ err });
  assert.strictEqual(out.err.name, 'Error');
  assert.strictEqual(out.err.code, 'ERR_BAD_REQUEST');
  assert.strictEqual(out.err.status, 401);
  assert.strictEqual(out.err.method, 'post');
  assert.ok(out.err.url.includes('token=[MASKED]'));
  assert.ok(typeof out.err.stack === 'string');
  const flat = JSON.stringify(out);
  assert.ok(!flat.includes('dummy-secret-token'), 'url token must be masked');
  assert.ok(!flat.includes('dummy-header-secret'), 'headers must not be logged');
  assert.ok(!flat.includes('advent-services-token'), 'header keys must not be logged');
  assert.ok(!flat.includes('+61412345678'), 'config.data must not be logged');
  assert.ok(!flat.includes('unauthorized'), 'response.data must not be logged');
}

// --- Idempotency: a second pass is a no-op (mobile obfuscation is self-inverse)
{
  const x = {
    mobile: '+61412345678',
    to: 'jane.doe@example.com',
    nested: { from: '+61498765432', name_note: 'plain' },
    list: [{ mobile: '+61411111111' }],
  };
  const once = sanitizeLog(x);
  const twice = sanitizeLog(once);
  assert.deepStrictEqual(twice, once, 'sanitizeLog must be idempotent');
  assert.strictEqual(once.mobile, Obfuscate.mobile('+61412345678'));
}

// --- Contact fields (#6): email under `to`, mobile under `from` --------------
{
  const out = sanitizeLog({ to: 'jane.doe@example.com', from: '+61412345678' });
  assert.strictEqual(out.to, 'jane.dXX@example.com');
  assert.strictEqual(out.from, Obfuscate.mobile('+61412345678'));
}

// --- res reduction (#14): live ServerResponse-like object → {statusCode} -----
{
  const fakeRes = {
    setHeader() {},
    statusCode: 200,
    socket: { bigBuffer: Buffer.alloc(10) },
  };
  const out = sanitizeLog({ res: fakeRes, msg_extra: 'kept' });
  assert.deepStrictEqual(out.res, { statusCode: 200 });
  assert.strictEqual(out.msg_extra, 'kept');
  assert.strictEqual(typeof fakeRes.setHeader, 'function', 'original res must not be mutated');
}

// --- toJSON returning `this` must not recurse forever ------------------------
{
  const evil = { toJSON() { return this; }, mobile: '+61412345678' };
  const out = sanitizeLog({ evil });
  assert.strictEqual(out.evil, '[Circular]');
}

// --- maskGraphQLStrings ------------------------------------------------------
{
  const q = 'mutation { sendMessage(text: "hello Jane at 12 Example St", tag: """block""") { id } }';
  const masked = maskGraphQLStrings(q);
  assert.ok(!masked.includes('Jane'));
  assert.ok(!masked.includes('block'));
  assert.ok(masked.includes('sendMessage'), 'field names stay readable');
}

// --- Exports (#4 enabler) ----------------------------------------------------
assert.strictEqual(typeof core.maskGraphQLStrings, 'function');
assert.strictEqual(typeof core.sanitizeLog, 'function');
assert.strictEqual(typeof core.Obfuscate.contact, 'function');
assert.strictEqual(core.Obfuscate.contact('jane.doe@example.com'), 'jane.dXX@example.com');
assert.strictEqual(core.Obfuscate.contact('+61412345678'), Obfuscate.mobile('+61412345678'));

console.log('All tests passed!');
