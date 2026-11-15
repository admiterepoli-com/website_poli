/**
 * Shared types for the content components (comparison pages such as
 * `cti-vs-is` and `etti-vs-cti`).
 *
 * The variant names are the suffixes of the legacy class names
 * (`tag-cti`, `card-myth`, ...). Do not rename them: the CSS in
 * `src/styles/07-barem-cod.css` targets these classes.
 */

/** Suffix of a `.tag-*` class. */
export type TagVariant = 'cti' | 'is' | 'etti' | 'en';

/** Suffix of a `.card-*` class used together with `.triple-card`. */
export type CardVariant = TagVariant | 'myth';

/** Grid wrappers from the "Grid Variations" CSS section. */
export type GridKind = 'triple' | 'materii' | 'myth';

/** One header cell of a comparison table, after the first ("criterion") column. */
export interface ComparisonColumn {
  /** Text after the pill tag, for example `Calculatoare`. */
  label: string;
  tag: {
    variant: TagVariant;
    /** Text inside the pill, for example `CTI`. */
    label: string;
  };
}

/** One body row of a comparison table. */
export interface ComparisonRow {
  /** First cell, rendered in `<strong>`. */
  label: string;
  /** One value per column, in column order. */
  cells: readonly string[];
}
