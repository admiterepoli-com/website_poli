/**
 * Countdown button on `simulari` (the legacy "Countdown timer" block from main.js).
 *
 * `#glass-countdown-btn` starts out `locked` and shows the time left until its
 * `data-target` date inside `#countdown-timer`. When the date is reached the
 * button switches to `active` and the ticking stops.
 */

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
const SECOND_MS = 1000;

function pad(value: number): string {
  return String(Math.floor(value)).padStart(2, '0');
}

/** Text shown on the locked button, e.g. `03z 07h 05m 09s`. */
export function formatCountdown(distance: number): string {
  const d = pad(distance / DAY_MS);
  const h = pad((distance % DAY_MS) / HOUR_MS);
  const m = pad((distance % HOUR_MS) / MINUTE_MS);
  const s = pad((distance % MINUTE_MS) / SECOND_MS);
  return `${d}z ${h}h ${m}m ${s}s`;
}

export function initCountdown(): void {
  const btn = document.getElementById('glass-countdown-btn');
  const timerText = document.getElementById('countdown-timer');
  if (!btn || !timerText) return;

  // Data ţintă vine din data-target pe buton, ca să nu fie hardcodată aici.
  // Fără data-target rezultă NaN, exact ca `new Date(undefined)` în main.js.
  const targetDate = new Date(btn.dataset.target ?? NaN).getTime();

  function tickCountdown(): void {
    if (!btn || !timerText) return;
    const distance = targetDate - Date.now();

    if (distance <= 0) {
      btn.classList.remove('locked');
      btn.classList.add('active');
    } else {
      timerText.innerText = formatCountdown(distance);
      setTimeout(tickCountdown, SECOND_MS);
    }
  }
  tickCountdown(); // Run immediately — no 1-second locked flash on page load
}
