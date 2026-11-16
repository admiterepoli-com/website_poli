/**
 * Unit tests of the exam scoring, results markup, Sheets payload and saved
 * result, against reference copies of the legacy `submitAll` / `finalizeExam`
 * arithmetic and string building of the four `simulare-2026-*` pages.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import {
  FIZICA,
  INFO,
  LEGACY_BADGES,
  LEGACY_COUNTDOWN_TIMER,
  LEGACY_DEADLINE_TIMER,
  LEGACY_RULES,
  MATE,
} from '../../data/simulations/_schema';
import { buildSaveInput, buildSheetsPayload, resultsHtml, warningHtml } from './results';
import {
  answerDetails,
  buildExamResult,
  isCorrectAnswer,
  pickBadge,
  scorePercent,
  scoreSection,
} from './scoring';
import { createExamState, startExam } from './state';
import { ANSWER_KEYS } from './types';
import type {
  AnswerKey,
  AnswerSheet,
  ExamConfig,
  ExamState,
  Problem,
  Section,
  Track,
  TrackId,
} from './types';

/* ── Fixtures ─────────────────────────────────────────────────── */

const T0 = Date.UTC(2026, 6, 21, 14, 0, 0);

/** Ten problems whose correct answers cycle through a to f. */
function problems(offset: number): Problem[] {
  return Array.from({ length: 10 }, (_, i) => ({
    statement: `Problema ${i + 1}`,
    options: ['a) 1', 'b) 2', 'c) 3', 'd) 4', 'e) 5', 'f) 6'],
    correct: ANSWER_KEYS[(i + offset) % ANSWER_KEYS.length] ?? 'a',
  }));
}

const info: Section = { ...INFO, problems: problems(0) };
const fizica: Section = { ...FIZICA, problems: problems(2) };
const mate: Section = { ...MATE, problems: problems(4) };

/** Simulations 1 and 2: one track, no selection, countdown timer. */
const SINGLE: ExamConfig = {
  id: 'simulare-2026-03-21',
  access: { kind: 'free' },
  trackSelection: false,
  tracks: [
    {
      id: 'info',
      sections: [info, mate],
      resultId: 'simulare-2026-03-21',
      resultTitle: 'Simulare 21 Martie 2026',
    },
  ],
  ...LEGACY_RULES,
  timer: LEGACY_COUNTDOWN_TIMER,
  resultsEndpoint: 'https://example.invalid/1',
};

function tracksConfig(id: 'simulare-2026-05-09' | 'simulare-2026-07-21', deadline: boolean): ExamConfig {
  const title = (disc: string): string =>
    id === 'simulare-2026-05-09'
      ? `Simulare #3 — Mate + ${disc} (9 Mai 2026)`
      : `Simulare #4 — Mate + ${disc} (Iulie 2026)`;
  return {
    id,
    access: {
      kind: 'paid',
      simulationId: id === 'simulare-2026-05-09' ? 'simulare_09_05' : 'simulare-21-07',
    },
    trackSelection: true,
    tracks: [
      { id: 'info', sections: [info, mate], resultId: `${id}-info`, resultTitle: title('Informatica') },
      { id: 'fizica', sections: [fizica, mate], resultId: `${id}-fizica`, resultTitle: title('Fizica') },
    ],
    ...LEGACY_RULES,
    timer: deadline ? LEGACY_DEADLINE_TIMER : LEGACY_COUNTDOWN_TIMER,
    resultsEndpoint: 'https://example.invalid/3',
  };
}

/** Simulation 3: two tracks, countdown timer. */
const SIM3 = tracksConfig('simulare-2026-05-09', false);
/** Simulation 4: two tracks, deadline timer. */
const SIM4 = tracksConfig('simulare-2026-07-21', true);

function trackOf(config: ExamConfig, id: TrackId): Track {
  const track = config.tracks.find((candidate) => candidate.id === id);
  if (!track) throw new Error(`no track ${id}`);
  return track;
}

/** A started sitting with the given answer sheets and seconds left. */
function sitting(
  config: ExamConfig,
  trackId: TrackId,
  disc: AnswerSheet,
  mates: AnswerSheet,
  secondsLeft: number,
): ExamState {
  const state = createExamState(config, () => 0.123456);
  startExam(state, config, trackId, T0);
  state.answers = { info: [...disc], mate: [...mates] };
  state.secondsLeft = secondsLeft;
  return state;
}

/** Answer sheets used for every simulation. */
const SHEETS: Record<string, (section: Section) => AnswerSheet> = {
  blank: (section) => section.problems.map(() => null),
  allCorrect: (section) => section.problems.map((problem) => problem.correct),
  allWrong: (section) => section.problems.map((problem) => (problem.correct === 'a' ? 'b' : 'a')),
  firstThree: (section) => section.problems.map((problem, i) => (i < 3 ? problem.correct : null)),
  mixed: (section) =>
    section.problems.map((problem, i): AnswerKey | null =>
      i % 3 === 0 ? null : i % 3 === 1 ? problem.correct : problem.correct === 'f' ? 'e' : 'f',
    ),
};

/* ── Reference: legacy arithmetic, copied from the pages ───────── */

interface LegacyDetail {
  problem: number;
  answer: string | null;
  correct: string;
}

/** `discResults` / `mateResults` and the filter that counts them (all four pages). */
function legacyScore(section: Section, sheet: AnswerSheet): { details: LegacyDetail[]; score: number } {
  const details = section.problems.map((p, i) => ({
    problem: i + 1,
    answer: sheet[i] ?? null,
    correct: p.correct,
  }));
  const score = details.filter((a) => a.answer && a.answer.toLowerCase() === a.correct.toLowerCase()).length;
  return { details, score };
}

/** Results markup of simulation 4 (`finalizeExam`), simplified to its string concatenation. */
function legacyResultsHtml(
  track: TrackId,
  badgeClass: string,
  badgeText: string,
  scoreTotal: number,
  scoreDisc: number,
  scoreMate: number,
  discN: number,
  mateN: number,
  userCode: string,
  elapsed: string,
): string {
  const totalN = discN + mateN;
  const discPct = discN ? (scoreDisc / discN) * 100 : 0;
  const matePct = mateN ? (scoreMate / mateN) * 100 : 0;
  const discLabel = track === 'fizica' ? 'Fizica' : 'Informatica';
  const discIcon = track === 'fizica' ? 'Φ' : '{ }';
  const discScoreClass = track === 'fizica' ? 'sc-fizica-res' : 'sc-info';
  const discBarClass = track === 'fizica' ? 'bf-fizica-res' : 'bf-info';
  const discIconClass = track === 'fizica' ? 'rc-fizica-res' : 'rc-info';
  return (
    '<div class="sim-results">' +
    '<div class="sim-results-badge ' +
    badgeClass +
    '">' +
    badgeText +
    '</div>' +
    '<div class="sim-results-total-wrap">' +
    '<div class="sim-results-total-number">' +
    scoreTotal +
    ' / ' +
    totalN +
    '</div>' +
    '<div class="sim-results-total-label">Scor Total</div>' +
    '</div>' +
    '<div class="sim-results-sections">' +
    '<div class="sim-results-card">' +
    '<div class="sim-results-card-icon ' +
    discIconClass +
    '">' +
    discIcon +
    '</div>' +
    '<div class="sim-results-card-label">' +
    discLabel +
    '</div>' +
    '<div class="sim-results-card-score ' +
    discScoreClass +
    '">' +
    scoreDisc +
    ' / ' +
    discN +
    '</div>' +
    '<div class="sim-results-card-bar"><div class="sim-results-card-bar-fill ' +
    discBarClass +
    '" style="width:' +
    discPct +
    '%"></div></div>' +
    '</div>' +
    '<div class="sim-results-card">' +
    '<div class="sim-results-card-icon rc-mate">&sum;</div>' +
    '<div class="sim-results-card-label">Matematica</div>' +
    '<div class="sim-results-card-score sc-mate">' +
    scoreMate +
    ' / ' +
    mateN +
    '</div>' +
    '<div class="sim-results-card-bar"><div class="sim-results-card-bar-fill bf-mate" style="width:' +
    matePct +
    '%"></div></div>' +
    '</div>' +
    '</div>' +
    '<div class="sim-results-meta">' +
    '<div class="sim-results-meta-item"><p>Cod participant</p><p><strong>' +
    userCode +
    '</strong></p></div>' +
    '<div class="sim-results-meta-item"><p>Timp folosit</p><p><span class="meta-time">' +
    elapsed +
    '</span></p></div>' +
    '</div>' +
    '</div>'
  );
}

/* ── Tests ────────────────────────────────────────────────────── */

describe('isCorrectAnswer', () => {
  it('compares letters ignoring case and never counts a blank', () => {
    assert.equal(isCorrectAnswer('b', 'b'), true);
    assert.equal(isCorrectAnswer('a', 'b'), false);
    assert.equal(isCorrectAnswer(null, 'b'), false);
    assert.equal(isCorrectAnswer(undefined, 'b'), false);
  });
});

describe('scorePercent', () => {
  it('divides first, as legacy did, so the bar width keeps the same float digits', () => {
    assert.equal(scorePercent(1, 3), 33.33333333333333);
    assert.equal(scorePercent(3, 10), 30);
    assert.equal(scorePercent(7, 10), 70);
    assert.equal(scorePercent(0, 0), 0);
  });
});

describe('scoreSection', () => {
  it('applies custom points, wrong and blank penalties', () => {
    const section: Section = {
      ...INFO,
      problems: [
        { ...(info.problems[0] as Problem), correct: 'a', points: 3 },
        { ...(info.problems[0] as Problem), correct: 'b' },
        { ...(info.problems[0] as Problem), correct: 'c' },
      ],
    };
    const result = scoreSection(section, ['a', 'c', null], {
      pointsPerCorrect: 1,
      pointsPerWrong: -0.25,
      pointsPerBlank: -0.5,
    });
    assert.equal(result.score, 3 - 0.25 - 0.5);
    assert.equal(result.maxScore, 5);
  });

  it('numbers the details from 1 and keeps blanks as null', () => {
    assert.deepEqual(answerDetails(info, ['a']).slice(0, 2), [
      { problem: 1, answer: 'a', correct: 'a' },
      { problem: 2, answer: null, correct: 'b' },
    ]);
  });
});

describe('pickBadge', () => {
  it('chooses by how the exam ended, then by threshold, first match wins', () => {
    assert.equal(pickBadge(LEGACY_BADGES, true, 100).className, 'badge-timeout');
    assert.equal(pickBadge(LEGACY_BADGES, false, 0).className, 'badge-done');
    const tiered = [
      { when: 'submitted', minScorePercent: 80, className: 'top', text: 'Top' },
      ...LEGACY_BADGES,
    ] as const;
    assert.equal(pickBadge(tiered, false, 85).className, 'top');
    assert.equal(pickBadge(tiered, false, 79).className, 'badge-done');
    assert.throws(() => pickBadge([LEGACY_BADGES[0]], false, 0));
  });
});

const SIMULATIONS: readonly [string, ExamConfig][] = [
  ['simulations 1 and 2', SINGLE],
  ['simulation 3', SIM3],
  ['simulation 4', SIM4],
];

for (const [name, config] of SIMULATIONS) {
  describe(`legacy parity: ${name}`, () => {
    for (const track of config.tracks) {
      const [disc, mates] = [track.sections[0], track.sections[1] ?? mate];
      for (const [sheetName, makeSheet] of Object.entries(SHEETS)) {
        for (const timeUp of [false, true]) {
          it(`${track.id} track, ${sheetName} answers, ${timeUp ? 'time up' : 'submitted'}`, () => {
            const discSheet = makeSheet(disc);
            const mateSheet = makeSheet(mates);
            const state = sitting(config, track.id, discSheet, mateSheet, 3 * 60 * 60 - 3725);
            const result = buildExamResult(config, track, state, timeUp);

            const ref = { disc: legacyScore(disc, discSheet), mate: legacyScore(mates, mateSheet) };
            const scoreTotal = ref.disc.score + ref.mate.score;
            assert.equal(result.score, scoreTotal);
            assert.equal(result.sections[0]?.score, ref.disc.score);
            assert.equal(result.sections[1]?.score, ref.mate.score);
            assert.equal(result.sections[0]?.percent, (ref.disc.score / 10) * 100);
            assert.equal(result.sections[1]?.percent, (ref.mate.score / 10) * 100);
            assert.equal(result.elapsedLabel, '1h 2min 5s');
            assert.equal(result.elapsedSeconds, 3725);

            const badgeClass = timeUp ? 'badge-timeout' : 'badge-done';
            const badgeText = timeUp ? 'Timpul a expirat' : 'Simulare finalizata';
            assert.equal(
              resultsHtml(track, result),
              legacyResultsHtml(
                track.id,
                badgeClass,
                badgeText,
                scoreTotal,
                ref.disc.score,
                ref.mate.score,
                10,
                10,
                state.participantCode,
                '1h 2min 5s',
              ),
            );

            const payload = buildSheetsPayload(config, result);
            const expected = config.trackSelection
              ? {
                  id_participant: state.participantCode,
                  track: track.id,
                  timp_folosit: '1h 2min 5s',
                  scor_total: scoreTotal,
                  ['scor_' + track.id]: ref.disc.score,
                  scor_mate: ref.mate.score,
                  ['detalii_' + track.id]: ref.disc.details,
                  detalii_mate: ref.mate.details,
                }
              : {
                  id_participant: state.participantCode,
                  timp_folosit: '1h 2min 5s',
                  scor_total: scoreTotal,
                  scor_info: ref.disc.score,
                  scor_mate: ref.mate.score,
                  detalii_info: ref.disc.details,
                  detalii_mate: ref.mate.details,
                };
            // Same keys, same order, same values: the posted body is byte for byte the legacy one.
            assert.equal(JSON.stringify(payload), JSON.stringify(expected));
          });
        }
      }
    }
  });
}

describe('results screen', () => {
  it('reproduces the hard-coded simulation 1 markup (/ 20, / 10)', () => {
    const track = trackOf(SINGLE, 'info');
    const state = sitting(
      SINGLE,
      'info',
      SHEETS.firstThree?.(info) ?? [],
      SHEETS.allCorrect?.(mate) ?? [],
      100,
    );
    const html = resultsHtml(track, buildExamResult(SINGLE, track, state, false));
    assert.ok(html.includes('<div class="sim-results-total-number">13 / 20</div>'));
    assert.ok(html.includes('<div class="sim-results-card-icon rc-info">{ }</div>'));
    assert.ok(html.includes('<div class="sim-results-card-score sc-info">3 / 10</div>'));
    assert.ok(html.includes('style="width:30%"'));
    assert.ok(html.includes('style="width:100%"'));
  });
});

describe('saved result', () => {
  const result = (config: ExamConfig, trackId: TrackId) => {
    const track = trackOf(config, trackId);
    const state = sitting(
      config,
      trackId,
      SHEETS.mixed?.(track.sections[0]) ?? [],
      SHEETS.allCorrect?.(mate) ?? [],
      600,
    );
    return { track, result: buildExamResult(config, track, state, false) };
  };

  it('simulations 1 and 2 send scoreInfo and no track', () => {
    const { track, result: r } = result(SINGLE, 'info');
    assert.deepEqual(buildSaveInput(SINGLE, track, r, false), {
      title: 'Simulare 21 Martie 2026',
      scoreTotal: r.score,
      scoreInfo: r.sections[0]?.score,
      scoreMate: 10,
      timeElapsed: 3 * 60 * 60 - 600,
    });
  });

  it('simulation 3 sends scoreDisc and no track', () => {
    const { track, result: r } = result(SIM3, 'fizica');
    assert.deepEqual(buildSaveInput(SIM3, track, r, false), {
      title: 'Simulare #3 — Mate + Fizica (9 Mai 2026)',
      scoreTotal: r.score,
      scoreDisc: r.sections[0]?.score,
      scoreMate: 10,
      timeElapsed: 3 * 60 * 60 - 600,
    });
    assert.equal(track.resultId, 'simulare-2026-05-09-fizica');
  });

  it('simulation 4 also sends the track', () => {
    const { track, result: r } = result(SIM4, 'fizica');
    assert.deepEqual(buildSaveInput(SIM4, track, r, true), {
      title: 'Simulare #4 — Mate + Fizica (Iulie 2026)',
      track: 'fizica',
      scoreTotal: r.score,
      scoreDisc: r.sections[0]?.score,
      scoreMate: 10,
      timeElapsed: 3 * 60 * 60 - 600,
    });
  });
});

describe('blank-problems warning', () => {
  it('has the long text on single-track pages and the short one otherwise', () => {
    assert.ok(warningHtml('single-track', 4).includes('Atenție! 4 subiecte goale'));
    assert.ok(warningHtml('single-track', 4).includes('nerezolvate la Matematică și/sau Informatică.'));
    assert.ok(warningHtml('single-track', 4).includes('onclick="submitAll(false, true)"'));
    assert.ok(warningHtml('tracks', 2).includes('Atenție! 2 subiecte goale'));
    assert.ok(warningHtml('tracks', 2).includes('Mai ai întrebări nerezolvate. Sigur'));
    assert.ok(warningHtml('tracks', 2).includes('onclick="submitAll(false,true)"'));
  });
});
