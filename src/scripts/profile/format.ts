/**
 * Pure helpers of the profile page (from legacy `profile.js`). No DOM and no Firebase, so the unit
 * tests load them in plain Node.
 */

/** Escapes text for use inside HTML markup and attribute values (legacy `escHtml`). */
export function escHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Score badge of a simulation result out of 20 (legacy `getBadge`). */
export interface ResultBadge {
  text: 'Excelent' | 'Bine' | 'Suficient' | 'Insuficient';
  cls: 'badge-excellent' | 'badge-good' | 'badge-ok' | 'badge-fail';
}

export function getBadge(score: number): ResultBadge {
  if (score >= 16) return { text: 'Excelent', cls: 'badge-excellent' };
  if (score >= 11) return { text: 'Bine', cls: 'badge-good' };
  if (score >= 6) return { text: 'Suficient', cls: 'badge-ok' };
  return { text: 'Insuficient', cls: 'badge-fail' };
}

/** Initials shown in the navbar avatar after the display name is saved. */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** `9 mai 2026`: the date format used everywhere on the profile page. */
export function formatRoDate(date: Date): string {
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Which Student Plus plan a paid account has, from its Gumroad product permalink. */
export type PaidPlan = 'monthly' | 'preadmitere' | 'admitere' | 'legacy-3m';

export function paidPlanOf(product: string): PaidPlan {
  // Ordinea contează: „student-plus-preadmitere” conţine şi „admitere”.
  if (product.includes('preadmitere')) return 'preadmitere';
  if (product.includes('admitere')) return 'admitere';
  if (product.includes('lunar')) return 'monthly';
  if (product.includes('student-plus')) return 'legacy-3m';
  return 'monthly';
}
