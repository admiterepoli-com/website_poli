/**
 * Entry of the exercitii-video page (rest of the legacy inline module): click handling, the
 * auth-dependent access level and the Firestore lookup of the YouTube ids.
 *
 * Access levels, as on the legacy page:
 * - signed out: `none`, every lesson locked, no video id fetched;
 * - signed in with a paid status (`PAID_STATUSES`): `plus`, every video id fetched;
 * - any other signed-in account: `account`, only the free lessons' ids fetched;
 * - user document unreadable: `account`, without fetching anything.
 */
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, type Firestore } from 'firebase/firestore';

import { exercitiiInfo, exercitiiMate } from '../../data/exercitii-video';
import { auth, db } from '../../lib/firebase/app';
import { PAID_STATUSES, type UserDoc } from '../../types/firestore';
import { renderGrids, setupTabs, type CardContext, type UserLevel } from './catalog';
import { bindVideoModal, openVideoModal } from './modal';

/** Current state of the page; `render()` redraws both grids from it. */
const state: { userLevel: UserLevel; videoIds: Record<string, string>; email: string | null } = {
  userLevel: 'none',
  videoIds: {},
  email: null,
};

function render(userLevel: UserLevel): void {
  state.userLevel = userLevel;
  const ctx: CardContext = { userLevel, videoIds: state.videoIds, email: state.email };
  renderGrids(ctx);
}

/** Opens the sign-in modal through the navbar button, which the auth module may add a bit later. */
function openAuthModal(): void {
  const trigger = document.getElementById('nav-auth-trigger');
  if (trigger) {
    trigger.click();
    return;
  }
  const t = setInterval(() => {
    const found = document.getElementById('nav-auth-trigger');
    if (found) {
      clearInterval(t);
      found.click();
    }
  }, 80);
  setTimeout(() => clearInterval(t), 3000);
}

function setupClicks(): void {
  document.querySelector('.ev-catalog')?.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    // "Creează cont" — deschide modal auth
    if (e.target.closest('[data-open-auth]')) {
      e.preventDefault();
      openAuthModal();
      return;
    }
    // "Upgrade acum"
    const upBtn = e.target.closest('[data-upgrade-url]');
    if (upBtn) {
      e.preventDefault();
      if (state.userLevel === 'none') {
        openAuthModal();
      } else if (typeof window.openUpgradeModal === 'function') {
        window.openUpgradeModal();
      } else {
        const raw = upBtn.getAttribute('data-upgrade-url');
        if (raw) {
          try {
            window.open(decodeURIComponent(raw), '_blank', 'noopener,noreferrer');
          } catch {
            // A malformed URL is ignored, as on the legacy page.
          }
        }
      }
      return;
    }
    // Click pe card deblocat → deschide modal video
    const card = e.target.closest<HTMLElement>('[data-ev-open]');
    if (card) {
      const videoId = state.videoIds[card.dataset.evDocid ?? ''];
      if (videoId) {
        openVideoModal(
          videoId,
          card.dataset.evNum ?? '',
          card.dataset.evTitle ?? '',
          card.dataset.evStatement ?? '',
        );
      }
    }
  });
}

async function fetchVideoIds(firestore: Firestore, docIds: readonly string[]): Promise<void> {
  try {
    const snaps = await Promise.all(docIds.map((id) => getDoc(doc(firestore, 'videos', id))));
    snaps.forEach((snap, i) => {
      const docId = docIds[i];
      const videoId: unknown = snap.exists() ? snap.data()['videoId'] : undefined;
      if (docId !== undefined && typeof videoId === 'string') state.videoIds[docId] = videoId;
    });
  } catch (e) {
    console.warn('[exercitii-video] fetchVideoIds error:', e);
  }
}

function isPaidStatus(status: UserDoc['status'] | null): boolean {
  return PAID_STATUSES.some((s) => s === status);
}

export function initExercitiiVideo(): void {
  bindVideoModal();
  setupTabs();
  setupClicks();
  render('none');

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      state.videoIds = {};
      render('none');
      return;
    }
    state.email = user.email;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const status = snap.exists() ? ((snap.data() as UserDoc).status ?? null) : null;
      const isPaid = isPaidStatus(status);

      // Fetch video IDs doar pentru nivelul de acces al userului
      const accessibleDocIds = [...exercitiiMate, ...exercitiiInfo]
        .filter((v) => v.access === 'account' || (v.access === 'plus' && isPaid))
        .map((v) => v.docId);
      await fetchVideoIds(db, accessibleDocIds);

      render(isPaid ? 'plus' : 'account');
    } catch {
      render('account');
    }
  });
}
