import type { Timestamp } from 'firebase/firestore';

import type { SimulationResultDoc } from '../../types/firestore';

/** A result as stored by the simulation pages; old documents may lack fields. */
export type ProfileResult = Partial<SimulationResultDoc<Timestamp>>;
