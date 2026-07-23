/**
 * Shared search-term validator, used unmodified on BOTH the frontend
 * (loaded by the browser as a static file) and the backend (required
 * by server.js). Using one implementation on both sides keeps the
 * rules consistent and avoids duplicated logic.
 *
 * Approach: allow-list validation (OWASP Proactive Control C3 -
 * "Validate all input" / OWASP Input Validation Cheat Sheet).
 * Only plain letters, digits and spaces are accepted. Every character
 * used in common SQL injection or XSS payloads - quotes, angle
 * brackets, semicolons, dashes, parentheses, equals signs, slashes,
 * etc. - is rejected outright, so no separate "is this an attack"
 * blacklist is needed.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SearchValidator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var MIN_LENGTH = 1;
  var MAX_LENGTH = 50;

  // Letters, digits and spaces only (ASCII). Unicode handling is out
  // of scope per requirements, so this stays a simple ASCII allow-list.
  var ALLOWED_PATTERN = /^[A-Za-z0-9 ]+$/;

  function validate(term) {
    if (typeof term !== 'string') {
      return { valid: false, reason: 'Search term must be text.' };
    }

    var trimmed = term.trim();

    if (trimmed.length < MIN_LENGTH) {
      return { valid: false, reason: 'Search term is required.' };
    }
    if (trimmed.length > MAX_LENGTH) {
      return { valid: false, reason: 'Search term must be ' + MAX_LENGTH + ' characters or fewer.' };
    }
    if (!ALLOWED_PATTERN.test(trimmed)) {
      return { valid: false, reason: 'Search term contains characters that are not allowed.' };
    }

    return { valid: true, value: trimmed };
  }

  return { validate: validate, MIN_LENGTH: MIN_LENGTH, MAX_LENGTH: MAX_LENGTH };
});
