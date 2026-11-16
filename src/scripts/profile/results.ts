/**
 * "Rezultatele mele" card of the profile page (legacy `renderResultsSection` in `profile.js`):
 * the user's simulation results, newest first, five at a time.
 * The injected HTML is byte-identical to the legacy one; do not reformat the template literals.
 */
import type { User } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../../lib/firebase/app';
import { escHtml, formatRoDate, getBadge } from './format';
import type { ProfileResult } from './types';

const PAGE_SIZE = 5;

function resultCard(r: ProfileResult): string {
  const date = r.completedAt?.toDate ? formatRoDate(r.completedAt.toDate()) : '—';
  // Legacy arithmetic on possibly missing scores: `undefined / 10 * 100` is NaN, shown as "NaN".
  const infoPct = ((r.scoreInfo ?? NaN) / 10) * 100;
  const matePct = ((r.scoreMate ?? NaN) / 10) * 100;
  const badge = getBadge(r.scoreTotal ?? NaN);

  return `
        <div class="profile-result-card">
          <div class="profile-result-header">
            <div>
              <div class="profile-result-title">${escHtml(r.title || r.simulationId)}</div>
              <div class="profile-result-date">${escHtml(date)}</div>
            </div>
            <span class="profile-result-badge ${badge.cls}">${badge.text}</span>
          </div>
          <div class="profile-result-score">${escHtml(r.scoreTotal)} / 20</div>
          <div class="profile-result-sections">
            <div class="profile-result-section">
              <div class="profile-result-section-label">
                <span>Informatică</span><span>${escHtml(r.scoreInfo)} / 10</span>
              </div>
              <div class="profile-result-bar">
                <div class="profile-result-bar-fill bar-info" style="width:${escHtml(infoPct)}%"></div>
              </div>
            </div>
            <div class="profile-result-section">
              <div class="profile-result-section-label">
                <span>Matematică</span><span>${escHtml(r.scoreMate)} / 10</span>
              </div>
              <div class="profile-result-bar">
                <div class="profile-result-bar-fill bar-mate" style="width:${escHtml(matePct)}%"></div>
              </div>
            </div>
          </div>
        </div>
      `;
}

export async function renderResultsSection(user: User): Promise<void> {
  const container = document.getElementById('profile-results-content');
  if (!container) return;

  try {
    const resultsRef = collection(db, 'users', user.uid, 'simulationResults');
    const snap = await getDocs(resultsRef);

    if (snap.empty) {
      container.innerHTML = `
        <p class="profile-empty">Nu ai completat nicio simulare încă.</p>
        <a href="./simulari" class="profile-btn-primary profile-btn-inline">Mergi la Simulări</a>
      `;
      return;
    }

    // Sortăm descrescător după completedAt client-side (evităm nevoia de index Firestore)
    const results = snap.docs
      .map((d) => d.data() as ProfileResult)
      .sort((a, b) => (b.completedAt?.toMillis?.() ?? 0) - (a.completedAt?.toMillis?.() ?? 0));
    const allCards = results.map(resultCard);

    const renderCards = (count: number): void => {
      const visible = allCards.slice(0, count).join('');
      const remaining = allCards.length - count;
      const showMoreBtn =
        remaining > 0
          ? `<button class="profile-btn-secondary profile-show-more" id="btn-show-more">Arată mai multe (${remaining})</button>`
          : '';
      container.innerHTML = visible + showMoreBtn;
      if (remaining > 0) {
        document.getElementById('btn-show-more')?.addEventListener('click', () => {
          renderCards(count + PAGE_SIZE);
        });
      }
    };

    renderCards(PAGE_SIZE);
  } catch (e) {
    console.error('[Profile] Eroare încărcare rezultate:', e);
    container.innerHTML = `<p class="profile-empty">Eroare la încărcarea rezultatelor.</p>`;
  }
}
