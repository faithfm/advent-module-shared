// Structured logging for Advent Services, built on Pino.
// Emits single-line NDJSON to stdout in production (non-TTY), and human-readable
// output via pino-pretty in local dev (TTY). See advent-docs
// "Logging Refactor Plan (Pino).md" for conventions, levels, and the redaction spec.

const pino = require('pino');
const Obfuscate = require('./obfuscate.logic');

// --- Sensitive-key classification (drives the redaction censor) -------------
// Secrets are removed entirely; PII is replaced by its human-reversible obfuscation.
const SECRET_KEYS = new Set([
  'otp', 'otp_code', 'token', 'auth_token', 'requestToken', 'password',
  'twilio_sid', 'twilio_token', 'TWILIO_SID', 'TWILIO_TOKEN',
  'api_private_key', 'service_email_pwd', 'DB_URL',
  'street_lat', 'street_lng', 'lat', 'lng',
]);
const MOBILE_KEYS = new Set([
  'mobile', 'to', 'from', 'phone_number', 'ambassador_mobile', 'service_mobile',
]);
const EMAIL_KEYS = new Set(['email', 'service_email']);
const ADDRESS_KEYS = new Set([
  'street_address', 'street_address_full', 'street_address_line1', 'street_address_line2', 'address',
]);
const NAME_KEYS = new Set(['firstname', 'lastname', 'ambassador_fullname']);

const ALL_KEYS = [
  ...SECRET_KEYS, ...MOBILE_KEYS, ...EMAIL_KEYS, ...ADDRESS_KEYS, ...NAME_KEYS,
];

// Safety-net paths. Explicit obfuscation at the call site is the primary mechanism
// (see plan §5); this catches sensitive keys at the top level, one level deep, and
// inside request bodies/queries logged by pino-http.
function buildRedactPaths() {
  const paths = [];
  for (const k of ALL_KEYS) {
    paths.push(k, `*.${k}`, `req.body.${k}`, `req.query.${k}`);
  }
  return paths;
}

// One censor, dispatched by the leaf key of the path being redacted.
function censor(value, path) {
  const key = path[path.length - 1];
  if (MOBILE_KEYS.has(key)) return Obfuscate.mobile(value);
  if (EMAIL_KEYS.has(key)) return Obfuscate.email(value);
  if (ADDRESS_KEYS.has(key)) return Obfuscate.address(value);
  if (NAME_KEYS.has(key)) return Obfuscate.name(value);
  return Obfuscate.REDACTED;
}

const redact = { paths: buildRedactPaths(), censor };

function baseOptions(serviceName, bindings) {
  const options = {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: serviceName, ...bindings },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Emit the level as its string label ("info"/"warn"/...) rather than a number.
    formatters: { level(label) { return { level: label }; } },
    redact,
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

// pino-http middleware: one structured line per request, sharing the service logger
// (and therefore its redaction). Status >= 500 -> error, >= 400 -> warn, else info.
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
      return `${req.method} ${req.url} -> ${res.statusCode}`;
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          ip: req.remoteAddress,
          body: req.raw && req.raw.body,
        };
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

module.exports = { createLogger, httpLogger, internalLogger, redact };
