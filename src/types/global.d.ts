/**
 * Globals shared between inline scripts, legacy pages and the typed modules.
 * Anything put on `window` must be declared here.
 */
import type { PaidSimulationId, SimulationResultInput } from './firestore';

interface BaremConfig {
  simId: PaidSimulationId;
  /** Must equal the `examGateStart` of the matching simulation page. */
  startsAt: Date;
  startLabel: string;
  label?: string;
  buyUrl?: string | null;
  /** Relative URL of the matching simulation page. */
  simUrl?: string;
  /** When the barem becomes public, as shown to the visitor. */
  publicLabel?: string;
}

declare global {
  interface Window {
    /** Google Analytics queue and helper (set by the inline gtag snippet). */
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    /** Analytics opt-out flag toggled by the cookie consent script. */
    'ga-disable-G-PC1VMXYCRN'?: boolean;

    /** Set in the <head> of a simulation page, before any other script runs. */
    examGateStart?: Date;
    examGateStartLabel?: string;
    simulationId?: PaidSimulationId;
    simulationLabel?: string;
    simulationBuyUrl?: string;

    /** Set in the <head> of a gated barem page. */
    baremConfig?: BaremConfig;

    /** Exposed by the auth module for inline handlers and simulation pages. */
    openModal?: () => void;
    openUpgradeModal?: () => void;
    saveSimulationResult?: (simulationId: string, data: SimulationResultInput) => Promise<void>;

    /** Email of the signed-in user, used by the video exercises page. */
    _evEmail?: string | null;
  }
}

export {};
