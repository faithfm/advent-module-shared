// Structured logging for Advent Services, built on Pino.
// Emits single-line NDJSON to stdout in production (non-TTY), and human-readable
// output via pino-pretty in local dev (TTY). See advent-docs
// "Logging Refactor Plan (Pino).md" for conventions, levels, and the redaction spec.

const pino = require('pino');
const Obfuscate = require('./obfuscate.logic');

// --- Sensitive-key classification (drives the scrub) ------------------------
// A field is treated as sensitive by its NAME. Secrets are removed entirely; PII
// is replaced by its human-reversible obfuscation (see obfuscate.logic.js).
const SECRET_KEYS = new Set([
  'otp', 'otp_code', 'token', 'auth_token', 'requestToken', 'password',
  'twilio_sid', 'twilio_token', 'TWILIO_SID', 'TWILIO_TOKEN',
  'api_private_key', 'service_email_pwd', 'DB_URL',
  // Home-address coordinates (PII). Every real *_lat/*_lng field name in the
  // schemas; NOT the generic `lat`/`lng`, which are only search-query inputs
  // (getTaskEstimate/getGeoStats) — a search centre, not a person's home.
  'street_lat', 'street_lng',
  'address_street_lat', 'address_street_lng',
  'contact_street_lat', 'contact_street_lng',
  // Debug-redirect target: holds a mobile OR an email depending on call site.
  'overriddenTo',
]);
const MOBILE_KEYS = new Set([
  'mobile', 'to', 'from', 'phone_number', 'ambassador_mobile', 'service_mobile',
  'contact_phone',
]);
const EMAIL_KEYS = new Set(['email', 'service_email', 'contact_email']);
const ADDRESS_KEYS = new Set([
  'street_address', 'street_address_full', 'street_address_line1', 'street_address_line2', 'address',
  'address_street', 'contact_address',
]);
const NAME_KEYS = new Set([
  'firstname', 'lastname', 'ambassador_fullname', 'contact_first_name', 'contact_last_name',
]);

// Map one field name + value to its logged form, or NOT_SENSITIVE to keep and
// recurse. Safety net behind the call-site whitelisting convention (plan §5).
const NOT_SENSITIVE = Symbol('not-sensitive');
function scrubKey(key, value) {
  if (SECRET_KEYS.has(key)) return Obfuscate.REDACTED;
  if (MOBILE_KEYS.has(key)) return Obfuscate.mobile(value);
  if (EMAIL_KEYS.has(key)) return Obfuscate.email(value);
  if (ADDRESS_KEYS.has(key)) return Obfuscate.address(value);
  if (NAME_KEYS.has(key)) return Obfuscate.name(value);
  return NOT_SENSITIVE;
}

// --- The one place every log object is cleaned -----------------------------
// One recursive walk that scrubs sensitive keys (scrubKey) and coerces exotic
// values (toJSON types, Buffers, cycles, throwing getters) into plain safe ones —
// fused into a single pass so no later stage can choke on a value and leak the
// fields next to it. INVARIANT: keep it one pass; don't add a second redactor.
//
// Wired as pino's formatters.log, which covers direct calls only: pino-http sends
// `req` through child bindings, which bypass that hook, so the httpLogger req
// serializer below runs this same walk itself.
const MAX_DEPTH = 8;
// Marks sanitize() output so a repeat walk is a no-op. Load-bearing: the mobile
// obfuscation is self-inverse, so scrubbing twice would un-obfuscate.
const SCRUBBED = Symbol('advent-scrubbed');
function markScrubbed(obj) {
  try { Object.defineProperty(obj, SCRUBBED, { value: true }); } catch (_) { /* frozen — skip */ }
  return obj;
}
function sanitize(value, seen, depth) {
  if (value === null || typeof value !== 'object') return value;
  if (value[SCRUBBED]) return value;
  if (Buffer.isBuffer(value)) return `[Buffer ${value.length}]`;
  if (typeof value.toJSON === 'function') {
    try { return sanitize(value.toJSON(), seen, depth + 1); } catch (_) { /* fall through to walk */ }
  }
  if (depth >= MAX_DEPTH) return '[truncated]';
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (Array.isArray(value)) return markScrubbed(value.map((v) => sanitize(v, seen, depth + 1)));
  const out = {};
  for (const key of Object.keys(value)) {
    // Scrub sensitive keys in place; recurse into everything else.
    const scrubbed = scrubKey(key, value[key]);
    if (scrubbed !== NOT_SENSITIVE) { out[key] = scrubbed; continue; }
    try { out[key] = sanitize(value[key], seen, depth + 1); }
    catch (_) { out[key] = '[unserializable]'; }
  }
  return markScrubbed(out);
}
function sanitizeLog(obj) {
  return sanitize(obj, new WeakSet(), 0);
}

function baseOptions(serviceName, bindings) {
  const options = {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: serviceName, ...bindings },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      // Emit the level as its string label ("info"/"warn"/...) rather than a number.
      level(label) { return { level: label }; },
      // The sole redaction/coercion pass (see sanitize above). Direct calls only —
      // http request lines are scrubbed in the httpLogger req serializer.
      log: sanitizeLog,
    },
  };
  // Human-readable output only when attached to a TTY (i.e. local dev, never in Docker).
  if (process.stdout.isTTY) {
    options.transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    };
  }
  return options;
}

// Create a service logger. `bindings` become fixed fields on every line
// (e.g. { version, env }).
function createLogger(serviceName, bindings = {}) {
  return pino(baseOptions(serviceName, bindings));
}

// The key-based scrub can't see into a GraphQL query string, where inline argument
// values would land raw — mask every string literal; names stay readable.
// (`variables` is a normal object, scrubbed by key.)
function maskGraphQLStrings(query) {
  // Block strings first, replaced without quotes so the second pass skips them.
  return query
    .replace(/"""[\s\S]*?"""/g, '[MASKED]')
    .replace(/"(?:[^"\\]|\\.)*"/g, '"[MASKED]"');
}

// PII also travels in URL query params (e.g. task-request links append &mobile=...).
function maskUrl(url) {
  if (typeof url !== 'string') return url;
  return url.replace(/([?&](?:mobile|email|to|from|phone_number|otp|token)=)[^&#]*/gi, '$1[MASKED]');
}

// pino-http middleware: one structured line per request. Status >= 500 -> error,
// >= 400 -> warn, else info. The req serializer must scrub its own output —
// pino-http sends req through child bindings, which bypass formatters.log.
function httpLogger(logger) {
  const pinoHttp = require('pino-http');
  return pinoHttp({
    logger,
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${maskUrl(req.url)} -> ${res.statusCode}`;
    },
    serializers: {
      req(req) {
        const raw = req.raw || req;
        let body = raw.body;
        if (body && typeof body === 'object' && typeof body.query === 'string') {
          body = { ...body, query: maskGraphQLStrings(body.query) };
        }
        return sanitizeLog({
          id: req.id,
          method: req.method,
          url: maskUrl(req.url),
          ip: req.remoteAddress,
          body,
        });
      },
      res(res) {
        // formatters.log runs before serializers and its copy drops the
        // non-enumerable .raw link — read statusCode from whichever has it.
        const raw = (res && res.raw) || res || {};
        return { statusCode: raw.statusCode !== undefined ? raw.statusCode : null };
      },
    },
  });
}

// Lazily-created logger for the shared module's own internal logs.
let _internal;
function internalLogger() {
  if (!_internal) {
    _internal = createLogger('advent-module-shared', {
      version: require('../package.json').version,
    });
  }
  return _internal;
}

module.exports = { createLogger, httpLogger, internalLogger };
