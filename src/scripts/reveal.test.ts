/** Unit tests of the scheduled reveal, with Vitest fake timers and a minimal fake DOM. */

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { revealScheduled, type RevealTarget } from './reveal';

/* ── Fake DOM ─────────────────────────────────────────────────── */

const REVEAL_AT = '2026-07-24T10:00:00+03:00';
const REVEAL_AT_MS = new Date(REVEAL_AT).getTime();
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

interface FakeElement extends RevealTarget {
  dataset: { revealAfter?: string };
  removed: string[];
}

/** An element as the HTML ships it: `style="display:none" data-reveal-after="…"`. */
function hiddenElement(revealAfter: string): FakeElement {
  const el: FakeElement = {
    dataset: { revealAfter },
    style: { display: 'none' },
    removed: [],
    removeAttribute(name) {
      el.removed.push(name);
      if (name === 'data-reveal-after') delete el.dataset.revealAfter;
    },
  };
  return el;
}

interface FakeDocument {
  readyState: 'loading' | 'interactive' | 'complete';
  selectors: string[];
  listeners: Map<string, () => void>;
  querySelectorAll(selector: string): FakeElement[];
  addEventListener(type: string, listener: () => void): void;
}

function fakeDocument(
  elements: FakeElement[],
  readyState: FakeDocument['readyState'] = 'complete',
): FakeDocument {
  const doc: FakeDocument = {
    readyState,
    selectors: [],
    listeners: new Map(),
    querySelectorAll(selector) {
      doc.selectors.push(selector);
      // Ca în browser: elementele rămase fără atribut nu mai sunt selectate.
      return elements.filter((el) => el.dataset.revealAfter !== undefined);
    },
    addEventListener(type, listener) {
      doc.listeners.set(type, listener);
    },
  };
  return doc;
}

/** A fresh copy of the module, so its "initialised once" flag starts cleared. */
async function loadInit(doc: FakeDocument): Promise<() => void> {
  vi.stubGlobal('document', doc);
  vi.resetModules();
  const module = await import('./reveal');
  return module.initScheduledReveal;
}

/* ── revealScheduled ──────────────────────────────────────────── */

describe('revealScheduled', () => {
  it('leaves an element hidden before its date and reports when it is due', () => {
    const el = hiddenElement(REVEAL_AT);

    assert.equal(revealScheduled([el], REVEAL_AT_MS - 1), REVEAL_AT_MS);
    assert.equal(el.style.display, 'none');
    assert.deepEqual(el.removed, []);
  });

  it("shows an element once its date has passed, restoring display to '' rather than 'block'", () => {
    const el = hiddenElement(REVEAL_AT);

    assert.equal(revealScheduled([el], REVEAL_AT_MS), null);
    assert.equal(el.style.display, '');
    assert.deepEqual(el.removed, ['data-reveal-after']);
  });

  it('never shows an element with a missing or unparsable date', () => {
    const invalid = hiddenElement('nu e o dată');
    const empty = hiddenElement('');
    const missing = hiddenElement(REVEAL_AT);
    delete missing.dataset.revealAfter;

    assert.equal(revealScheduled([invalid, empty, missing], REVEAL_AT_MS + DAY), null);
    for (const el of [invalid, empty, missing]) {
      assert.equal(el.style.display, 'none');
      assert.deepEqual(el.removed, []);
    }
  });

  it('handles each element by its own date and returns the earliest one still pending', () => {
    const past = hiddenElement('2026-07-01T00:00:00+03:00');
    const later = hiddenElement('2026-09-01T00:00:00+03:00');
    const sooner = hiddenElement('2026-08-01T00:00:00+03:00');

    const next = revealScheduled([past, later, sooner], REVEAL_AT_MS);

    assert.equal(next, new Date('2026-08-01T00:00:00+03:00').getTime());
    assert.equal(past.style.display, '');
    assert.equal(later.style.display, 'none');
    assert.equal(sooner.style.display, 'none');
  });

  it('uses the current time when none is given', () => {
    vi.useFakeTimers();
    try {
      const el = hiddenElement(REVEAL_AT);

      vi.setSystemTime(REVEAL_AT_MS - 1);
      revealScheduled([el]);
      assert.equal(el.style.display, 'none');

      vi.setSystemTime(REVEAL_AT_MS);
      revealScheduled([el]);
      assert.equal(el.style.display, '');
    } finally {
      vi.useRealTimers();
    }
  });
});

/* ── initScheduledReveal ──────────────────────────────────────── */

describe('initScheduledReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps the element hidden before the date and shows it after, without a reload', async () => {
    vi.setSystemTime(REVEAL_AT_MS - 10 * MINUTE);
    const el = hiddenElement(REVEAL_AT);
    const doc = fakeDocument([el]);
    const init = await loadInit(doc);

    init();
    assert.deepEqual(doc.selectors, ['[data-reveal-after]']);
    assert.equal(el.style.display, 'none');

    vi.advanceTimersByTime(10 * MINUTE - 1);
    assert.equal(el.style.display, 'none');

    vi.advanceTimersByTime(1);
    assert.equal(el.style.display, '');
    assert.deepEqual(el.removed, ['data-reveal-after']);
    assert.equal(vi.getTimerCount(), 0);
  });

  it('shows an element whose date has already passed straight away, with no timer', async () => {
    vi.setSystemTime(REVEAL_AT_MS + DAY);
    const el = hiddenElement(REVEAL_AT);
    const init = await loadInit(fakeDocument([el]));

    init();

    assert.equal(el.style.display, '');
    assert.equal(vi.getTimerCount(), 0);
  });

  it('reveals several elements one after the other, each at its own date', async () => {
    vi.setSystemTime(REVEAL_AT_MS - MINUTE);
    const first = hiddenElement(REVEAL_AT);
    const second = hiddenElement('2026-07-24T11:00:00+03:00');
    const init = await loadInit(fakeDocument([second, first]));

    init();
    vi.advanceTimersByTime(MINUTE);
    assert.equal(first.style.display, '');
    assert.equal(second.style.display, 'none');

    vi.advanceTimersByTime(60 * MINUTE);
    assert.equal(second.style.display, '');
    assert.equal(vi.getTimerCount(), 0);
  });

  it('waits for a date further away than the longest delay setTimeout accepts', async () => {
    vi.setSystemTime(REVEAL_AT_MS - 40 * DAY);
    const el = hiddenElement(REVEAL_AT);
    const init = await loadInit(fakeDocument([el]));

    init();
    // Un delay peste 2^31-1 ms ar porni imediat; elementul trebuie să rămână ascuns.
    vi.advanceTimersByTime(1);
    assert.equal(el.style.display, 'none');

    vi.advanceTimersByTime(40 * DAY - 2);
    assert.equal(el.style.display, 'none');

    vi.advanceTimersByTime(1);
    assert.equal(el.style.display, '');
  });

  it('sets no timer when no element has a usable date', async () => {
    vi.setSystemTime(REVEAL_AT_MS);
    const el = hiddenElement('nu e o dată');
    const init = await loadInit(fakeDocument([el]));

    init();

    assert.equal(el.style.display, 'none');
    assert.equal(vi.getTimerCount(), 0);
  });

  it('waits for DOMContentLoaded while the document is still loading', async () => {
    vi.setSystemTime(REVEAL_AT_MS + MINUTE);
    const el = hiddenElement(REVEAL_AT);
    const doc = fakeDocument([el], 'loading');
    const init = await loadInit(doc);

    init();
    assert.equal(el.style.display, 'none');
    assert.deepEqual(doc.selectors, []);

    doc.listeners.get('DOMContentLoaded')?.();
    assert.equal(el.style.display, '');
  });

  it('starts only once, however many times it is called', async () => {
    vi.setSystemTime(REVEAL_AT_MS - MINUTE);
    const doc = fakeDocument([hiddenElement(REVEAL_AT)]);
    const init = await loadInit(doc);

    init();
    init();

    assert.equal(doc.selectors.length, 1);
    assert.equal(vi.getTimerCount(), 1);
  });
});
