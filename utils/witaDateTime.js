const WITA_OFFSET = '+08:00';

/**
 * Parse a datetime string entered as WITA (Asia/Makassar).
 * Naive values like "2026-06-10T14:00:00" are interpreted as WITA, not server local time.
 */
function parseWitaDateTime(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (!s) return null;

  if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const match = s.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (match) {
    const [, date, hour = '0', minute = '00', second = '00'] = match;
    const hh = String(hour).padStart(2, '0');
    const ss = String(second).padStart(2, '0');
    const d = new Date(`${date}T${hh}:${minute}:${ss}${WITA_OFFSET}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(s);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function validateWitaDateTime(value, { futureErrorLabel = 'datetime' } = {}) {
  const parsed = parseWitaDateTime(value);
  if (!parsed) {
    return { error: `Invalid ${futureErrorLabel} date format` };
  }
  if (parsed.getTime() > Date.now()) {
    return { error: `${futureErrorLabel} cannot be in the future` };
  }
  return { parsed };
}

module.exports = {
  parseWitaDateTime,
  validateWitaDateTime,
};
