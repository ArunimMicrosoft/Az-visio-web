// Cadence helpers for email_schedules rows.
//
// Pure functions — no I/O. Given a schedule row and a reference `now` Date,
// decide whether the row is "due" (needs to fire this hourly tick) and what
// the next scheduled fire time looks like (used for UI "next run" display).
//
// Presets fire in UTC. The GitHub Actions cron runs hourly at the top of the
// hour; the handler treats every row as due when `now >= nextRun(row)`.
//
// Supported cadence presets (keep in sync with AdminEmailSchedules.jsx):
//   - weekly_mon_09     : Mondays at 09:00 UTC
//   - weekly_fri_17     : Fridays at 17:00 UTC
//   - daily_09          : Every day at 09:00 UTC
//   - monthly_1st_09    : 1st of every month at 09:00 UTC
//   - custom            : custom_cron expression (minute, hour, dom, mon, dow)
//
// Custom cron parser is intentionally minimal — it supports:
//   - '*'          : wildcard
//   - 'N'          : exact integer
//   - 'N,M,...'    : comma list
//   - '*/N'        : step
// It evaluates against the current UTC minute/hour/dom/mon/dow and treats
// the row as due whenever the current tick matches AND the last run (if any)
// is more than 50 minutes in the past. One-per-cadence-window is the goal,
// not stock cron fidelity.

const PRESET_FRIENDLY = {
  weekly_mon_09:   'Weekly — Monday 09:00 UTC',
  weekly_fri_17:   'Weekly — Friday 17:00 UTC',
  daily_09:        'Daily — 09:00 UTC',
  monthly_1st_09:  'Monthly — 1st at 09:00 UTC',
  custom:          'Custom cron',
};

export function friendlyCadence(row) {
  if (!row) return '—';
  if (row.cadence === 'custom') {
    return row.custom_cron ? `Custom: ${row.custom_cron}` : 'Custom (not configured)';
  }
  return PRESET_FRIENDLY[row.cadence] || row.cadence;
}

/**
 * Next fire time strictly after a given "from" Date, for a preset cadence.
 * Returns a Date in UTC.
 */
function nextPresetRun(preset, from) {
  const next = new Date(from.getTime());
  next.setUTCSeconds(0, 0);

  switch (preset) {
    case 'daily_09': {
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      while (next <= from) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }
    case 'weekly_mon_09': {
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      // Monday === 1 under JS UTC
      while (next <= from || next.getUTCDay() !== 1) {
        next.setUTCDate(next.getUTCDate() + 1);
      }
      return next;
    }
    case 'weekly_fri_17': {
      next.setUTCMinutes(0);
      next.setUTCHours(17);
      // Friday === 5
      while (next <= from || next.getUTCDay() !== 5) {
        next.setUTCDate(next.getUTCDate() + 1);
      }
      return next;
    }
    case 'monthly_1st_09': {
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      next.setUTCDate(1);
      while (next <= from) {
        next.setUTCMonth(next.getUTCMonth() + 1);
      }
      return next;
    }
    default:
      // Unknown preset — never fire automatically
      return new Date(8640000000000000);
  }
}

/**
 * Parse a single cron field value like a wildcard, '5', '0,15,30', or a
 * step form (star-slash-N) against a bound [min, max]. Returns true if
 * `value` matches.
 */
function cronFieldMatches(field, value, min, max) {
  if (!field || field === '*') return true;
  // Step form: */N
  const stepMatch = /^\*\/(\d+)$/.exec(field);
  if (stepMatch) {
    const step = parseInt(stepMatch[1], 10);
    if (!step || step < 1) return false;
    return (value - min) % step === 0;
  }
  // Comma list (allows single-value, which is just a 1-item list)
  const parts = field.split(',').map((p) => p.trim()).filter(Boolean);
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (!Number.isNaN(n) && n >= min && n <= max && n === value) return true;
  }
  return false;
}

function parseCron(expr) {
  if (!expr || typeof expr !== 'string') return null;
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [m, h, dom, mon, dow] = parts;
  return { m, h, dom, mon, dow };
}

function cronMatches(expr, now) {
  const cron = parseCron(expr);
  if (!cron) return false;
  return (
    cronFieldMatches(cron.m, now.getUTCMinutes(), 0, 59) &&
    cronFieldMatches(cron.h, now.getUTCHours(), 0, 23) &&
    cronFieldMatches(cron.dom, now.getUTCDate(), 1, 31) &&
    cronFieldMatches(cron.mon, now.getUTCMonth() + 1, 1, 12) &&
    cronFieldMatches(cron.dow, now.getUTCDay(), 0, 6)
  );
}

/**
 * The "next run" display value. For presets this is deterministic. For
 * custom, we approximate by scanning the next 7 days of hour-top ticks.
 * Returns a Date (UTC) or null if we can't determine one.
 */
export function nextRun(row, nowRef) {
  if (!row) return null;
  const now = nowRef instanceof Date ? nowRef : new Date();
  const lastRun = row.last_run_at ? new Date(row.last_run_at) : null;
  const from = lastRun && lastRun > new Date(0) ? lastRun : new Date(now.getTime() - 1000);

  if (row.cadence === 'custom') {
    if (!row.custom_cron) return null;
    const probe = new Date(now.getTime());
    probe.setUTCSeconds(0, 0);
    probe.setUTCMinutes(0);
    // Look forward 24 * 7 ticks = one week of hour tops
    for (let i = 0; i < 24 * 7; i++) {
      probe.setUTCHours(probe.getUTCHours() + (i === 0 ? 0 : 1));
      if (probe <= from) continue;
      if (cronMatches(row.custom_cron, probe)) return new Date(probe.getTime());
    }
    return null;
  }

  return nextPresetRun(row.cadence, from);
}

/**
 * Due if we've crossed into (or past) the next scheduled window. For custom
 * cron, due if this hour matches the expression AND we haven't run in the
 * last ~50 minutes (so a tick that fires at :00 won't re-fire at :05 on a
 * manual replay).
 */
export function isDue(row, nowRef) {
  if (!row || !row.enabled) return false;
  const now = nowRef instanceof Date ? nowRef : new Date();

  if (row.cadence === 'custom') {
    if (!row.custom_cron) return false;
    if (!cronMatches(row.custom_cron, now)) return false;
    if (!row.last_run_at) return true;
    const sinceLastMs = now.getTime() - new Date(row.last_run_at).getTime();
    return sinceLastMs >= 50 * 60 * 1000;
  }

  const next = nextRun(row, now);
  if (!next) return false;
  return now >= next;
}
