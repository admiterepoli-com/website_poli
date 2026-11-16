import type { Timestamp } from 'firebase/firestore';

import type { SimulationResultDoc, UserDoc } from '../../types/firestore';

/**
 * The user document as the profile page reads it. `displayName` is written by this page (legacy
 * `profile.js`) but is not declared in `shared/firestore.d.ts` yet, so it is added here.
 */
export type ProfileUserDoc = UserDoc<Timestamp> & { displayName?: string };

/** A result as stored by the simulation pages; old documents may lack fields. */
export type ProfileResult = Partial<SimulationResultDoc<Timestamp>>;
