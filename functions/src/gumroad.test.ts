// Unit tests for the Gumroad webhook, run against an in-memory Firestore and Auth.
// Nothing here talks to Firebase: FieldValue and Timestamp are plain local values.
import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import type { PaidSimulationId } from '../../shared/firestore.js';
import {
  FIXED_TERM_PLANS,
  handleGumroadWebhook,
  matchFixedTermPlan,
  matchSimulationPermalink,
  SIMULATION_PERMALINKS,
  type MergeOption,
  type SimulationPermalink,
  type UserDocRef,
  type UserTransaction,
  type UserWrite,
  type WebhookAuth,
  type WebhookDeps,
  type WebhookFirestore,
} from './gumroad.js';

const TOKEN = 'secret-token';

type StoredUser = Record<string, unknown>;

interface RecordedWrite {
  uid: string;
  data: UserWrite;
  options: MergeOption;
  inTransaction: boolean;
}

interface RecordedQuery {
  field: string;
  op: string;
  value: unknown;
  limit: number;
}

function uidOf(ref: UserDocRef): string {
  assert.ok('uid' in ref && typeof ref.uid === 'string');
  return ref.uid;
}

class FakeFirestore implements WebhookFirestore {
  readonly writes: RecordedWrite[] = [];
  readonly queries: RecordedQuery[] = [];
  failWrites = false;
  private readonly users: Map<string, StoredUser>;

  constructor(users: Map<string, StoredUser>) {
    this.users = users;
  }

  collection(path: 'users') {
    assert.equal(path, 'users');
    return {
      where: (field: string, op: '==', value: unknown) => ({
        limit: (limit: number) => ({
          get: async () => {
            this.queries.push({ field, op, value, limit });
            const docs = [...this.users]
              .filter(([, user]) => user[field] === value)
              .slice(0, limit)
              .map(([id]) => ({ id }));
            return { empty: docs.length === 0, docs };
          },
        }),
      }),
      doc: (uid: string): UserDocRef & { uid: string } => ({
        uid,
        set: async (data, options) => {
          if (this.failWrites) throw new Error('firestore unavailable');
          this.writes.push({ uid, data, options, inTransaction: false });
        },
      }),
    };
  }

  async runTransaction<T>(update: (tx: UserTransaction) => Promise<T>): Promise<T> {
    return update({
      get: async (ref) => {
        const user = this.users.get(uidOf(ref));
        return { exists: user !== undefined, get: (field: string) => user?.[field] };
      },
      set: (ref, data, options) => {
        this.writes.push({ uid: uidOf(ref), data, options, inTransaction: true });
      },
    });
  }
}

class FakeAuth implements WebhookAuth {
  readonly lookups: string[] = [];
  failure: unknown = undefined;
  private readonly uidByEmail: Map<string, string>;

  constructor(uidByEmail: Map<string, string>) {
    this.uidByEmail = uidByEmail;
  }

  async getUserByEmail(email: string): Promise<{ uid: string }> {
    this.lookups.push(email);
    if (this.failure !== undefined) throw this.failure;
    const uid = this.uidByEmail.get(email);
    if (uid === undefined) {
      throw Object.assign(new Error('no user'), { code: 'auth/user-not-found' });
    }
    return { uid };
  }
}

interface Reply {
  status: number;
  body: string;
}

interface HarnessOptions {
  users?: Record<string, StoredUser>;
  authUsers?: Record<string, string>;
  webhookToken?: string | undefined;
}

interface Harness {
  db: FakeFirestore;
  auth: FakeAuth;
  /** POST with the right token unless another one is given. */
  post(body: unknown, token?: unknown): Promise<Reply>;
  /** Any method; `token: undefined` sends no token at all. */
  send(method: string, body: unknown, token: unknown): Promise<Reply>;
  /** The single write the request produced. */
  onlyWrite(): RecordedWrite;
}

function harness(options: HarnessOptions = {}): Harness {
  const db = new FakeFirestore(new Map(Object.entries(options.users ?? {})));
  const auth = new FakeAuth(new Map(Object.entries(options.authUsers ?? {})));
  const deps: WebhookDeps = {
    db,
    auth,
    webhookToken: 'webhookToken' in options ? options.webhookToken : TOKEN,
  };
  const send = async (method: string, body: unknown, token: unknown): Promise<Reply> => {
    const replies: Reply[] = [];
    await handleGumroadWebhook(
      { method, query: token === undefined ? {} : { token }, body },
      { status: (status) => ({ send: (text) => replies.push({ status, body: text }) }) },
      deps,
    );
    assert.equal(replies.length, 1, 'the handler must answer exactly once');
    const [reply] = replies;
    assert.ok(reply);
    return reply;
  };
  return {
    db,
    auth,
    send,
    post: (body, token = TOKEN) => send('POST', body, token),
    onlyWrite: () => {
      assert.equal(db.writes.length, 1);
      const [write] = db.writes;
      assert.ok(write);
      return write;
    },
  };
}

/** Field-for-field comparison; FieldValue sentinels and Timestamps compare with isEqual. */
function assertWrite(actual: UserWrite, expected: Record<string, unknown>): void {
  const got: Record<string, unknown> = { ...actual };
  assert.deepEqual(Object.keys(got).sort(), Object.keys(expected).sort());
  for (const [field, want] of Object.entries(expected)) {
    const value = got[field];
    if (want instanceof FieldValue) {
      assert.ok(value instanceof FieldValue && value.isEqual(want), `field ${field}`);
    } else if (want instanceof Timestamp) {
      assert.ok(value instanceof Timestamp && value.isEqual(want), `field ${field}`);
    } else {
      assert.deepStrictEqual(value, want, `field ${field}`);
    }
  }
}

const BUYER = { authUsers: { 'ana@example.com': 'uid-ana' } };

describe('gumroadWebhook', () => {
  beforeEach(() => {
    // The handler logs every request; keep the test output readable.
    mock.method(console, 'log', () => undefined);
    mock.method(console, 'warn', () => undefined);
    mock.method(console, 'error', () => undefined);
  });

  describe('verification', () => {
    it('rejects methods other than POST with 405', async () => {
      const h = harness(BUYER);
      assert.deepEqual(await h.send('GET', {}, TOKEN), {
        status: 405,
        body: 'Method Not Allowed',
      });
      assert.equal(h.db.writes.length, 0);
    });

    it('rejects a wrong token with 401 and writes nothing', async () => {
      const h = harness(BUYER);
      const reply = await h.post({ email: 'ana@example.com' }, 'wrong');
      assert.deepEqual(reply, { status: 401, body: 'Unauthorized' });
      assert.equal(h.auth.lookups.length, 0);
      assert.equal(h.db.writes.length, 0);
    });

    it('rejects a missing token with 401', async () => {
      const h = harness(BUYER);
      const reply = await h.send('POST', { email: 'ana@example.com' }, undefined);
      assert.deepEqual(reply, { status: 401, body: 'Unauthorized' });
    });

    it('rejects everything when WEBHOOK_TOKEN is not configured', async () => {
      const unset = harness({ ...BUYER, webhookToken: undefined });
      assert.equal((await unset.send('POST', { email: 'ana@example.com' }, undefined)).status, 401);
      assert.equal((await unset.post({ email: 'ana@example.com' }, '')).status, 401);
      const empty = harness({ ...BUYER, webhookToken: '' });
      assert.equal((await empty.post({ email: 'ana@example.com' }, '')).status, 401);
      assert.equal(unset.db.writes.length + empty.db.writes.length, 0);
    });

    it('does not accept a token sent as a repeated query parameter', async () => {
      const h = harness(BUYER);
      assert.equal((await h.post({ email: 'ana@example.com' }, [TOKEN])).status, 401);
    });
  });

  describe('user lookup', () => {
    it('answers 400 when the ping has no email', async () => {
      const h = harness(BUYER);
      assert.deepEqual(await h.post({ sale_id: 's1' }), { status: 400, body: 'Missing email' });
      assert.equal(h.db.writes.length, 0);
    });

    it('lower-cases the email before the Auth lookup', async () => {
      const h = harness(BUYER);
      assert.equal((await h.post({ email: 'Ana@Example.COM' })).status, 200);
      assert.deepEqual(h.auth.lookups, ['ana@example.com']);
      assert.equal(h.onlyWrite().uid, 'uid-ana');
    });

    it('uses user_email when email is absent', async () => {
      const h = harness(BUYER);
      assert.equal((await h.post({ user_email: 'ana@example.com' })).status, 200);
      assert.equal(h.onlyWrite().uid, 'uid-ana');
    });

    it('falls back to users.emailLower when Auth does not know the email', async () => {
      const h = harness({ users: { 'uid-old': { emailLower: 'vechi@example.com' } } });
      assert.equal((await h.post({ email: 'Vechi@example.com' })).status, 200);
      assert.deepEqual(h.db.queries, [
        { field: 'emailLower', op: '==', value: 'vechi@example.com', limit: 1 },
      ]);
      assert.equal(h.onlyWrite().uid, 'uid-old');
    });

    it('answers 404 when neither Auth nor Firestore know the email', async () => {
      const h = harness();
      const reply = await h.post({ email: 'nimeni@example.com' });
      assert.deepEqual(reply, { status: 404, body: 'User not found' });
      assert.equal(h.db.writes.length, 0);
    });

    it('answers 500 on any other Auth error', async () => {
      const h = harness(BUYER);
      h.auth.failure = Object.assign(new Error('boom'), { code: 'auth/internal-error' });
      const reply = await h.post({ email: 'ana@example.com' });
      assert.deepEqual(reply, { status: 500, body: 'Internal error' });
      assert.equal(h.db.queries.length, 0);
    });

    it('answers 500 when the Firestore write fails', async () => {
      const h = harness(BUYER);
      h.db.failWrites = true;
      const reply = await h.post({ email: 'ana@example.com' });
      assert.deepEqual(reply, { status: 500, body: 'Internal error' });
    });

    it('answers 500 for an email that is not a string, as the legacy handler did', async () => {
      const h = harness(BUYER);
      const reply = await h.post({ email: ['ana@example.com'] });
      assert.deepEqual(reply, { status: 500, body: 'Internal error' });
      assert.equal(h.db.writes.length, 0);
    });
  });

  describe('sale: monthly subscription', () => {
    it('marks the user as paid and clears accessUntil', async () => {
      const h = harness(BUYER);
      const reply = await h.post({
        email: 'ana@example.com',
        product_permalink: 'student-plus',
        sale_id: 'sale-1',
        subscription_id: 'sub-1',
        refunded: 'false',
      });
      assert.deepEqual(reply, { status: 200, body: 'OK' });
      const write = h.onlyWrite();
      assert.equal(write.inTransaction, false);
      assert.deepEqual(write.options, { merge: true });
      assertWrite(write.data, {
        status: 'paid',
        gumroadSaleId: 'sale-1',
        gumroadProduct: 'student-plus',
        gumroadSubscriptionId: 'sub-1',
        accessUntil: FieldValue.delete(),
        paidAt: FieldValue.serverTimestamp(),
      });
    });

    it('writes null for the ids the ping does not carry', async () => {
      const h = harness(BUYER);
      assert.equal((await h.post({ email: 'ana@example.com' })).status, 200);
      assertWrite(h.onlyWrite().data, {
        status: 'paid',
        gumroadSaleId: null,
        gumroadProduct: null,
        gumroadSubscriptionId: null,
        accessUntil: FieldValue.delete(),
        paidAt: FieldValue.serverTimestamp(),
      });
    });

    it('is idempotent: a repeated ping produces the same merged write', async () => {
      const h = harness(BUYER);
      const ping = { email: 'ana@example.com', sale_id: 'sale-1', subscription_id: 'sub-1' };
      assert.equal((await h.post(ping)).status, 200);
      assert.equal((await h.post(ping)).status, 200);
      assert.equal(h.db.writes.length, 2);
      const [first, second] = h.db.writes;
      assert.ok(first && second);
      assert.deepEqual(second.options, { merge: true });
      assertWrite(second.data, { ...first.data });
    });

    // Legacy behaviour, kept as it is: a product the webhook does not know is
    // handled like the monthly subscription.
    it('treats an unknown product as a subscription sale', async () => {
      const h = harness(BUYER);
      const reply = await h.post({
        email: 'ana@example.com',
        product_permalink: 'alt-produs',
        sale_id: 'sale-9',
      });
      assert.deepEqual(reply, { status: 200, body: 'OK' });
      assertWrite(h.onlyWrite().data, {
        status: 'paid',
        gumroadSaleId: 'sale-9',
        gumroadProduct: 'alt-produs',
        gumroadSubscriptionId: null,
        accessUntil: FieldValue.delete(),
        paidAt: FieldValue.serverTimestamp(),
      });
    });
  });

  describe('sale: one-time simulation', () => {
    it('adds the simulation without touching status', async () => {
      const h = harness(BUYER);
      const reply = await h.post({
        email: 'ana@example.com',
        product_permalink: 'simulare-21-07',
        sale_id: 'sale-2',
      });
      assert.deepEqual(reply, { status: 200, body: 'Simulare access granted' });
      const write = h.onlyWrite();
      assert.deepEqual(write.options, { merge: true });
      assertWrite(write.data, {
        gumroadSaleId: 'sale-2',
        gumroadProduct: 'simulare-21-07',
        paidAt: FieldValue.serverTimestamp(),
        purchasedSimulations: FieldValue.arrayUnion('simulare-21-07'),
      });
    });

    it('accepts the "<seller>/<permalink>" form and stores the product as received', async () => {
      const h = harness(BUYER);
      const reply = await h.post({
        email: 'ana@example.com',
        product_permalink: 'admiterepoli/simulare_09_05',
      });
      assert.equal(reply.body, 'Simulare access granted');
      assertWrite(h.onlyWrite().data, {
        gumroadSaleId: null,
        gumroadProduct: 'admiterepoli/simulare_09_05',
        paidAt: FieldValue.serverTimestamp(),
        purchasedSimulations: FieldValue.arrayUnion('simulare_09_05'),
      });
    });
  });

  describe('sale: fixed-term plan', () => {
    const admitere = FIXED_TERM_PLANS['student-plus-admitere'];
    const preadmitere = FIXED_TERM_PLANS['student-plus-preadmitere'];

    it('grants access until the end date of the plan, in a transaction', async () => {
      const h = harness(BUYER);
      const reply = await h.post({
        email: 'ana@example.com',
        product_permalink: 'student-plus-preadmitere',
        sale_id: 'sale-3',
        subscription_id: 'ignored',
      });
      assert.deepEqual(reply, { status: 200, body: 'Fixed-term plan granted' });
      const write = h.onlyWrite();
      assert.equal(write.inTransaction, true);
      assert.deepEqual(write.options, { merge: true });
      assertWrite(write.data, {
        status: 'paid',
        gumroadSaleId: 'sale-3',
        gumroadProduct: 'student-plus-preadmitere',
        gumroadSubscriptionId: null,
        accessUntil: Timestamp.fromDate(preadmitere),
        paidAt: FieldValue.serverTimestamp(),
      });
    });

    it('does not shorten a longer access the user already has', async () => {
      const h = harness({
        ...BUYER,
        users: { 'uid-ana': { accessUntil: Timestamp.fromDate(admitere) } },
      });
      await h.post({ email: 'ana@example.com', product_permalink: 'student-plus-preadmitere' });
      const { data } = h.onlyWrite();
      assert.ok('accessUntil' in data && data.accessUntil instanceof Timestamp);
      assert.ok(data.accessUntil.isEqual(Timestamp.fromDate(admitere)));
    });

    it('extends a shorter access', async () => {
      const h = harness({
        ...BUYER,
        users: { 'uid-ana': { accessUntil: Timestamp.fromDate(preadmitere) } },
      });
      await h.post({ email: 'ana@example.com', product_permalink: 'x/student-plus-admitere' });
      const { data } = h.onlyWrite();
      assert.ok('accessUntil' in data && data.accessUntil instanceof Timestamp);
      assert.ok(data.accessUntil.isEqual(Timestamp.fromDate(admitere)));
    });

    it('keeps the legacy end dates', () => {
      assert.equal(preadmitere.toISOString(), '2027-04-05T20:59:59.000Z');
      assert.equal(admitere.toISOString(), '2027-07-31T20:59:59.000Z');
    });
  });

  describe('refund', () => {
    for (const refunded of ['true', true]) {
      it(`revokes access when refunded is ${JSON.stringify(refunded)}`, async () => {
        const h = harness(BUYER);
        const reply = await h.post({
          email: 'ana@example.com',
          product_permalink: 'simulare-21-07',
          sale_id: 'sale-2',
          refunded,
        });
        assert.deepEqual(reply, { status: 200, body: 'Refund processed' });
        const write = h.onlyWrite();
        assert.deepEqual(write.options, { merge: true });
        assertWrite(write.data, { status: 'free', refundedAt: FieldValue.serverTimestamp() });
      });
    }
  });

  describe('cancellation', () => {
    const subscriber = { users: { 'uid-sub': { gumroadSubscriptionId: 'sub-1' } } };

    it('finds the user by subscription_id and schedules the cancellation', async () => {
      const h = harness(subscriber);
      const reply = await h.post({
        user_email: 'seller@example.com',
        subscription_id: 'sub-1',
        cancelled: 'true',
        cancelled_at: '2026-12-01T10:00:00Z',
        cancelled_by_buyer: 'true',
      });
      assert.deepEqual(reply, { status: 200, body: 'Cancellation processed' });
      assert.equal(h.auth.lookups.length, 0);
      assert.deepEqual(h.db.queries, [
        { field: 'gumroadSubscriptionId', op: '==', value: 'sub-1', limit: 1 },
      ]);
      const write = h.onlyWrite();
      assert.equal(write.uid, 'uid-sub');
      assert.deepEqual(write.options, { merge: true });
      assertWrite(write.data, {
        status: 'pending_cancellation',
        pendingCancellationAt: '2026-12-01T10:00:00Z',
        cancelledByBuyer: true,
        cancelledDueToPaymentFailures: false,
      });
    });

    it('records a cancellation caused by payment failures', async () => {
      const h = harness(subscriber);
      await h.post({
        subscription_id: 'sub-1',
        cancelled: true,
        cancelled_due_to_payment_failures: 'true',
      });
      assertWrite(h.onlyWrite().data, {
        status: 'pending_cancellation',
        pendingCancellationAt: null,
        cancelledByBuyer: false,
        cancelledDueToPaymentFailures: true,
      });
    });

    it('answers 404 for a subscription nobody has', async () => {
      const h = harness(subscriber);
      const reply = await h.post({ subscription_id: 'sub-x', cancelled: 'true' });
      assert.deepEqual(reply, { status: 404, body: 'User not found' });
      assert.equal(h.db.writes.length, 0);
    });

    it('falls back to the email when the ping has no subscription_id', async () => {
      const h = harness(BUYER);
      const reply = await h.post({ user_email: 'ana@example.com', cancelled: 'true' });
      assert.equal(reply.body, 'Cancellation processed');
      assert.equal(h.onlyWrite().uid, 'uid-ana');
    });

    it('does not treat cancelled=false as a cancellation', async () => {
      const h = harness(BUYER);
      const reply = await h.post({ email: 'ana@example.com', cancelled: 'false' });
      assert.deepEqual(reply, { status: 200, body: 'OK' });
    });
  });

  describe('subscription_ended', () => {
    const subscriber = { users: { 'uid-sub': { gumroadSubscriptionId: 'sub-1' } } };

    it('revokes access and stores when and why it ended', async () => {
      const h = harness(subscriber);
      const reply = await h.post({
        subscription_id: 'sub-1',
        ended_at: '2026-12-01T10:00:00Z',
        ended_reason: 'failed_payment',
      });
      assert.deepEqual(reply, { status: 200, body: 'Subscription ended processed' });
      const write = h.onlyWrite();
      assert.equal(write.uid, 'uid-sub');
      assert.deepEqual(write.options, { merge: true });
      assertWrite(write.data, {
        status: 'free',
        subscriptionEndedAt: '2026-12-01T10:00:00Z',
        subscriptionEndedReason: 'failed_payment',
      });
    });

    it('takes precedence over the cancellation fields and stores a null reason', async () => {
      const h = harness(subscriber);
      const reply = await h.post({
        subscription_id: 'sub-1',
        cancelled: 'true',
        ended_at: '2026-12-01T10:00:00Z',
      });
      assert.equal(reply.body, 'Subscription ended processed');
      assertWrite(h.onlyWrite().data, {
        status: 'free',
        subscriptionEndedAt: '2026-12-01T10:00:00Z',
        subscriptionEndedReason: null,
      });
    });
  });

  describe('product matching', () => {
    it('matches the bare permalink and the "<seller>/<permalink>" form only', () => {
      assert.equal(matchSimulationPermalink('simulare_09_05'), 'simulare_09_05');
      assert.equal(matchSimulationPermalink('cineva/simulare-21-07'), 'simulare-21-07');
      assert.equal(matchSimulationPermalink('xsimulare-21-07'), null);
      assert.equal(matchSimulationPermalink('simulare-21-07/altceva'), null);
      assert.equal(matchSimulationPermalink(undefined), null);
      assert.equal(matchFixedTermPlan('student-plus-admitere'), 'student-plus-admitere');
      assert.equal(matchFixedTermPlan('u/student-plus-preadmitere'), 'student-plus-preadmitere');
      assert.equal(matchFixedTermPlan('student-plus'), null);
    });

    it('grants every PaidSimulationId', () => {
      // Compile-time check: fails to build if PaidSimulationId gains a value
      // that SIMULATION_PERMALINKS does not list (the reverse is checked in gumroad.ts).
      const everyIdListed: [Exclude<PaidSimulationId, SimulationPermalink>] extends [never] ? true : false = true;
      assert.equal(everyIdListed, true);
      for (const id of SIMULATION_PERMALINKS) assert.equal(matchSimulationPermalink(id), id);
    });
  });
});
