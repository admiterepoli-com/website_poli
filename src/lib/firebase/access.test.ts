import { describe, expect, it } from 'vitest';

import type { UserDoc, UserStatus } from '../../types/firestore';
import { hasSimulationAccess, isSaleClosed, SIMULATION_SALE_END } from './access';

const SIM = 'simulare-21-07';
const OTHER_SIM = 'simulare_09_05';

describe('hasSimulationAccess', () => {
  describe('paid statuses unlock every simulation', () => {
    const paid: UserStatus[] = ['paid', 'pending_cancellation', 'trial'];
    it.each(paid)('status %s', (status) => {
      expect(hasSimulationAccess({ status }, SIM)).toBe(true);
      expect(hasSimulationAccess({ status }, OTHER_SIM)).toBe(true);
      expect(hasSimulationAccess({ status }, null)).toBe(true);
      expect(hasSimulationAccess({ status })).toBe(true);
    });

    it.each(['standard', 'student-plus'] as const)('whatever the selected plan (%s)', (selectedPlan) => {
      expect(hasSimulationAccess({ status: 'paid', selectedPlan }, SIM)).toBe(true);
    });

    it.each(['monthly', 'preadmitere', 'admitere'] as const)(
      'whatever the billing (%s)',
      (selectedBilling) => {
        expect(hasSimulationAccess({ status: 'paid', selectedBilling }, SIM)).toBe(true);
      },
    );
  });

  describe('accounts without a paid status', () => {
    it.each(['free', 'trial_pending'] as const)('status %s has no access', (status) => {
      expect(hasSimulationAccess({ status }, SIM)).toBe(false);
    });

    it('a selected plan alone gives no access', () => {
      const data: UserDoc = { status: 'free', selectedPlan: 'student-plus', selectedBilling: 'admitere' };
      expect(hasSimulationAccess(data, SIM)).toBe(false);
    });

    it('a missing status counts as free', () => {
      expect(hasSimulationAccess({}, SIM)).toBe(false);
      expect(hasSimulationAccess({ email: 'a@b.ro' }, SIM)).toBe(false);
    });

    it('a missing document counts as free', () => {
      expect(hasSimulationAccess(null, SIM)).toBe(false);
      expect(hasSimulationAccess(undefined, SIM)).toBe(false);
    });

    it('an unknown stored status counts as not paid', () => {
      const data = { status: 'refunded' } as unknown as UserDoc;
      expect(hasSimulationAccess(data, SIM)).toBe(false);
    });
  });

  describe('trial', () => {
    it('an active trial unlocks everything', () => {
      expect(hasSimulationAccess({ status: 'trial' }, SIM)).toBe(true);
    });

    it('a pending trial does not', () => {
      expect(hasSimulationAccess({ status: 'trial_pending' }, SIM)).toBe(false);
    });

    it('a pending trial still keeps a purchased simulation', () => {
      expect(hasSimulationAccess({ status: 'trial_pending', purchasedSimulations: [SIM] }, SIM)).toBe(true);
    });
  });

  describe('per-simulation purchase', () => {
    it('unlocks the purchased simulation', () => {
      expect(hasSimulationAccess({ status: 'free', purchasedSimulations: [SIM] }, SIM)).toBe(true);
      expect(hasSimulationAccess({ purchasedSimulations: [OTHER_SIM, SIM] }, SIM)).toBe(true);
    });

    it('does not unlock another simulation', () => {
      expect(hasSimulationAccess({ status: 'free', purchasedSimulations: [OTHER_SIM] }, SIM)).toBe(false);
    });

    it('an empty list unlocks nothing', () => {
      expect(hasSimulationAccess({ status: 'free', purchasedSimulations: [] }, SIM)).toBe(false);
    });

    it('needs a simulation id', () => {
      const data: UserDoc = { status: 'free', purchasedSimulations: [SIM, ''] };
      expect(hasSimulationAccess(data, null)).toBe(false);
      expect(hasSimulationAccess(data, undefined)).toBe(false);
      expect(hasSimulationAccess(data, '')).toBe(false);
      expect(hasSimulationAccess(data)).toBe(false);
    });

    it('ignores a purchasedSimulations field that is not an array', () => {
      const asString = { status: 'free', purchasedSimulations: SIM } as unknown as UserDoc;
      const asMap = { status: 'free', purchasedSimulations: { [SIM]: true } } as unknown as UserDoc;
      expect(hasSimulationAccess(asString, SIM)).toBe(false);
      expect(hasSimulationAccess(asMap, SIM)).toBe(false);
    });

    it('matches the permalink exactly', () => {
      const data: UserDoc = { purchasedSimulations: ['simulare_21_07'] };
      expect(hasSimulationAccess(data, SIM)).toBe(false);
    });
  });

  describe('expiry', () => {
    const past = new Date('2020-01-01T00:00:00Z');
    const future = new Date('2099-01-01T00:00:00Z');

    // The site never compares `accessUntil` itself: the Cloud Functions set the status back to
    // `free` when a fixed-term plan ends. These tests pin that legacy behaviour.
    it('an expired plan already moved to free has no access', () => {
      expect(hasSimulationAccess({ status: 'free', accessUntil: past }, SIM)).toBe(false);
    });

    it('accessUntil in the future does not grant access by itself', () => {
      expect(hasSimulationAccess({ status: 'free', accessUntil: future }, SIM)).toBe(false);
    });

    it('a paid status is trusted even when accessUntil has passed', () => {
      expect(hasSimulationAccess({ status: 'paid', accessUntil: past }, SIM)).toBe(true);
    });

    it('a cancelled subscription keeps access until it is moved to free', () => {
      const data: UserDoc = { status: 'pending_cancellation', pendingCancellationAt: '2026-01-01T00:00:00Z' };
      expect(hasSimulationAccess(data, SIM)).toBe(true);
    });

    it('a purchased simulation survives the end of the plan', () => {
      const data: UserDoc = { status: 'free', accessUntil: past, purchasedSimulations: [SIM] };
      expect(hasSimulationAccess(data, SIM)).toBe(true);
    });
  });
});

describe('SIMULATION_SALE_END', () => {
  it('holds the legacy sale window', () => {
    expect(Object.keys(SIMULATION_SALE_END)).toEqual(['simulare-21-07']);
    expect(SIMULATION_SALE_END[SIM]?.toISOString()).toBe('2026-07-24T07:00:00.000Z');
  });
});

describe('isSaleClosed', () => {
  const end = new Date('2026-07-24T10:00:00+03:00');

  it('is open before the end of the sale', () => {
    expect(isSaleClosed(SIM, new Date(end.getTime() - 1))).toBe(false);
    expect(isSaleClosed(SIM, new Date('2026-07-21T09:00:00+03:00'))).toBe(false);
  });

  it('closes exactly at the end of the sale', () => {
    expect(isSaleClosed(SIM, end)).toBe(true);
  });

  it('stays closed afterwards', () => {
    expect(isSaleClosed(SIM, new Date(end.getTime() + 1))).toBe(true);
    expect(isSaleClosed(SIM, new Date('2027-01-01T00:00:00Z'))).toBe(true);
  });

  it('a simulation without a sale window never closes', () => {
    const farFuture = new Date('2099-01-01T00:00:00Z');
    expect(isSaleClosed(OTHER_SIM, farFuture)).toBe(false);
    expect(isSaleClosed('necunoscut', farFuture)).toBe(false);
    expect(isSaleClosed('constructor', farFuture)).toBe(false);
  });

  it('a missing simulation id never closes', () => {
    const farFuture = new Date('2099-01-01T00:00:00Z');
    expect(isSaleClosed(null, farFuture)).toBe(false);
    expect(isSaleClosed(undefined, farFuture)).toBe(false);
    expect(isSaleClosed('', farFuture)).toBe(false);
  });

  it('uses the current time when none is given', () => {
    expect(isSaleClosed(SIM)).toBe(new Date() >= end);
    expect(isSaleClosed(OTHER_SIM)).toBe(false);
  });
});
