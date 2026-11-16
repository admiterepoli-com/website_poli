/**
 * Firestore document types for the site.
 *
 * The types themselves are defined once, in `shared/firestore.d.ts`, and shared
 * with the Cloud Functions. This module re-exports them (type-only, so nothing
 * from `shared/` reaches the bundle) and adds the runtime values the site needs.
 */
import type { UserStatus } from '../../shared/firestore';

export type * from '../../shared/firestore';

/** Statuses that unlock all premium content (legacy `PAID_STATUSES`). */
export const PAID_STATUSES = [
  'paid',
  'pending_cancellation',
  'trial',
] as const satisfies readonly UserStatus[];
