// Pure, keyless, human-reversible obfuscation of PII for logs.
// Locked spec: see advent-docs "Logging Refactor Plan (Pino).md" §5.
//
// These transforms are intentionally NOT cryptographic. The goal is to make
// compromised log data a less-desirable target while letting a developer who
// knows the mechanism decode a value by hand. Same input -> same output across
// all services (no salt), so a value can be traced across the platform.

const REDACTED = '[REDACTED]';

// Mobile: transform the 6th-8th digits of the E.164 string via d -> (10 - d) % 10.
// Self-inverse (re-run to decode); 0 and 5 are fixed points.
//   +61412345678 -> +61412765678
// Result is still a valid-looking mobile — it's obfuscated, NOT a raw-PII leak
// (see "Logging Playbook.md" § Redaction). To check a value, run mobile() again:
// a different result means the logged form was already obfuscated.
function mobile(value) {
  if (value == null) return value;
  let digitIndex = 0;
  let out = '';
  for (const ch of String(value)) {
    if (ch >= '0' && ch <= '9') {
      digitIndex += 1;
      if (digitIndex >= 6 && digitIndex <= 8) {
        out += String((10 - (ch.charCodeAt(0) - 48)) % 10);
        continue;
      }
    }
    out += ch;
  }
  return out;
}

// Email: mask the last 2 characters of the local part (the part before '@').
// If the local part is <= 2 chars, mask all of it. Domain is left untouched.
//   jane.doe@example.com -> jane.dXX@example.com
function email(value) {
  if (value == null) return value;
  const s = String(value);
  const at = s.indexOf('@');
  const local = at < 0 ? s : s.slice(0, at);
  const domain = at < 0 ? '' : s.slice(at);
  const masked = local.length <= 2 ? 'X'.repeat(local.length) : local.slice(0, -2) + 'XX';
  return masked + domain;
}

// Address: keep the first 10 characters, append a fixed 'XXX' marker.
//   12 Example Street, SUBURB STATE 0000 -> 12 ExampleXXX
function address(value) {
  if (value == null) return value;
  return String(value).slice(0, 10) + 'XXX';
}

// Name: keep the first 3 characters, append a fixed 'XXX' marker.
// If <= 3 chars, return as-is.
//   Jane -> JanXXX   |   Jo -> Jo
function name(value) {
  if (value == null) return value;
  const s = String(value);
  return s.length <= 3 ? s : s.slice(0, 3) + 'XXX';
}

module.exports = { mobile, email, address, name, REDACTED };
