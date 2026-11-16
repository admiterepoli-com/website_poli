import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { validateSimulation, type SimulationData } from './_schema';

// Every simulation data file; `defineSimulation` already throws on import when one is invalid.
const files = import.meta.glob<{ default: SimulationData }>('./2*.ts', { eager: true });
const simulations = Object.entries(files).map(([path, mod]) => ({
  file: path.replace(/^\.\/|\.ts$/g, ''),
  exam: mod.default,
}));

describe('simulation data files', () => {
  it('finds the four simulations', () => {
    expect(simulations.map((s) => s.file).sort()).toEqual([
      '2026-03-21',
      '2026-03-26',
      '2026-05-09',
      '2026-07-21',
    ]);
  });

  describe.each(simulations)('$file', ({ file, exam }) => {
    it('is valid and named after its page', () => {
      expect(validateSimulation(exam)).toEqual([]);
      expect(exam.id).toBe(`simulare-${file}`);
      expect(existsSync(`src/pages/${exam.id}.astro`)).toBe(true);
    });

    it('has ten problems in every section of every track', () => {
      for (const track of exam.tracks) {
        for (const section of track.sections) expect(section.problems).toHaveLength(10);
      }
    });

    it('gives a paid simulation its own start time (the gate has no default, #137)', () => {
      if (exam.access.kind === 'paid') {
        expect(exam.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
        expect(exam.startsAtLabel).toBeTruthy();
      } else {
        expect(exam.startsAt).toBeUndefined();
      }
    });
  });

  it('opens simulation 3 at 10:00 on 9 May 2026 (decision on #137)', () => {
    const sim3 = simulations.find((s) => s.file === '2026-05-09')?.exam;
    expect(sim3?.startsAt).toBe('2026-05-09T10:00:00+03:00');
    expect(sim3?.startsAtLabel).toBe('9 Mai 2026, ora 10:00');
  });
});
