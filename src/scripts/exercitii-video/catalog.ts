/**
 * Lesson grids and tabs of the exercitii-video page (legacy `buildCard`, `renderCatalog`,
 * `renderGrids`, `setupTabs` from the inline module of exercitii-video.html).
 *
 * The card HTML is byte-identical to the legacy one; do not reformat the template literals.
 * No DOM access at import time, so `buildCard` / `renderCatalog` can be unit-tested in Node.
 */
import { exercitiiInfo, exercitiiMate, type Lesson } from '../../data/exercitii-video';

/** What the visitor may watch: nothing (signed out), the free lessons, or everything. */
export type UserLevel = 'none' | 'account' | 'plus';

const SVG_LOCK = `<svg class="ev-lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const SVG_STAR = `<svg class="ev-lock-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

/** Inputs of a card that do not come from the catalog. */
export interface CardContext {
  userLevel: UserLevel;
  /** docId -> YouTube id, filled from Firestore for the lessons the user may watch. */
  videoIds: Readonly<Record<string, string>>;
  /** Email of the signed-in user, prefilled in the Gumroad link of the Plus lock. */
  email: string | null | undefined;
}

export function canWatch(lesson: Lesson, userLevel: UserLevel): boolean {
  return (
    (lesson.access === 'account' && (userLevel === 'account' || userLevel === 'plus')) ||
    (lesson.access === 'plus' && userLevel === 'plus')
  );
}

export function buildCard(ex: Lesson, ctx: CardContext, idx: number): string {
  const numLabel = String(ex.id).padStart(2, '0');

  // Coming soon — thumbnail special, non-interactiv
  if (ex.comingSoon) {
    return `
                        <article class="ev-card is-coming-soon" style="--i:${idx}" aria-label="Lecția ${numLabel} — în curând">
                            <div class="ev-thumb">
                                <div class="ev-thumb-cs">
                                    <div class="ev-thumb-cs-orbit">
                                        <div class="ev-thumb-cs-ico">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        </div>
                                        <div class="ev-thumb-cs-dot"></div>
                                    </div>
                                    <span class="ev-thumb-cs-badge">În curând</span>
                                </div>
                            </div>
                            <div class="ev-card-body">
                                <p class="ev-card-num">Lecția ${numLabel}</p>
                                <p class="ev-card-title" style="color:rgba(243,237,227,0.32)">În curând</p>
                                <div class="ev-card-footer">
                                    <span class="ev-dur-chip" style="opacity:0.35">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        ~5 min
                                    </span>
                                </div>
                            </div>
                        </article>`;
  }

  const watchable = canWatch(ex, ctx.userLevel);

  const videoId = ctx.videoIds[ex.docId] || null;
  const media = videoId
    ? `<img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${ex.title}" loading="lazy">`
    : `<div class="ev-thumb-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>`;

  let lockHtml = '';
  if (!watchable) {
    if (ex.access === 'account') {
      lockHtml = `
                            <div class="ev-lock is-account">
                                ${SVG_LOCK}
                                <p class="ev-lock-text">Necesită cont gratuit</p>
                                <button type="button" class="ev-lock-btn" data-open-auth>Creează cont</button>
                            </div>`;
    } else {
      const email = ctx.email ? encodeURIComponent(ctx.email) : '';
      const url = `https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true${email ? '&email=' + email : ''}`;
      lockHtml = `
                            <div class="ev-lock is-plus">
                                <div class="ev-plus-badge">Student Plus</div>
                                ${SVG_STAR}
                                <p class="ev-lock-text">Disponibil cu Student Plus</p>
                                <button type="button" class="ev-lock-btn" data-upgrade-url="${encodeURIComponent(url)}">Upgrade acum</button>
                            </div>`;
    }
  }

  const plusCorner = ex.access === 'plus' && watchable ? '<div class="ev-plus-badge">Plus</div>' : '';
  const playBtn = watchable
    ? `<div class="ev-play-btn" aria-hidden="true"><div class="ev-play-circle"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>`
    : '';

  // docId în loc de videoId — video ID-ul nu ajunge în DOM
  const openAttrs =
    watchable && videoId
      ? `data-ev-open data-ev-docid="${ex.docId}" data-ev-num="${numLabel}" data-ev-title="${ex.title.replace(/"/g, '&quot;')}" data-ev-statement="${(ex.statement || '').replace(/"/g, '&quot;')}"`
      : '';

  return `
                    <article class="ev-card" style="--i:${idx}" ${openAttrs}>
                        <div class="ev-thumb">
                            ${media}
                            ${lockHtml}
                            ${plusCorner}
                            ${playBtn}
                        </div>
                        <div class="ev-card-body">
                            <p class="ev-card-num">Lecția ${numLabel}</p>
                            <p class="ev-card-title">${ex.title}</p>
                            <div class="ev-card-footer">
                                <span class="ev-dur-chip">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    ~5 min
                                </span>
                            </div>
                        </div>
                    </article>`;
}

export function renderCatalog(list: readonly Lesson[], ctx: CardContext): string {
  const free = list.filter((e) => e.access === 'account');
  const plus = list.filter((e) => e.access === 'plus');
  const { userLevel } = ctx;

  const freeStatus =
    userLevel === 'none' ? 'Cont gratuit necesar' : userLevel === 'plus' ? 'Deblocat' : 'Acces inclus';
  const plusStatus =
    userLevel === 'plus'
      ? 'Deblocat — abonament activ'
      : userLevel === 'account'
        ? 'Necesită Student Plus'
        : 'Disponibil cu Student Plus';
  let html = '';
  if (free.length) {
    html += `
                        <div class="ev-group is-free">
                            <div class="ev-group-header">
                                <div class="ev-group-name-wrap">
                                    <span class="ev-group-bar" aria-hidden="true"></span>
                                    <h3 class="ev-group-name">Cu cont gratuit</h3>
                                    <span class="ev-group-count">${free.length} lecții</span>
                                </div>
                                <span class="ev-group-status">${freeStatus}</span>
                            </div>
                            <div class="ev-grid">${free.map((e, i) => buildCard(e, ctx, i)).join('')}</div>
                        </div>`;
  }
  if (plus.length) {
    html += `
                        <div class="ev-group is-plus">
                            <div class="ev-group-header">
                                <div class="ev-group-name-wrap">
                                    <span class="ev-group-bar" aria-hidden="true"></span>
                                    <h3 class="ev-group-name">Student Plus</h3>
                                    <span class="ev-group-count">${plus.length} lecții</span>
                                </div>
                                <span class="ev-group-status">${plusStatus}</span>
                            </div>
                            <div class="ev-grid">${plus.map((e, i) => buildCard(e, ctx, i)).join('')}</div>
                        </div>`;
  }
  return html;
}

/** Fills both tab panels for the given access level. */
export function renderGrids(ctx: CardContext): void {
  const mate = document.getElementById('tab-mate');
  const info = document.getElementById('tab-info');
  if (mate) mate.innerHTML = renderCatalog(exercitiiMate, ctx);
  if (info) info.innerHTML = renderCatalog(exercitiiInfo, ctx);
}

/** Matematică / Informatică tabs, with arrow-key navigation. */
export function setupTabs(): void {
  const tabs = [...document.querySelectorAll<HTMLElement>('.ev-tab')];
  const activate = (btn: HTMLElement): void => {
    tabs.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.ev-section').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`tab-${btn.dataset.tab ?? ''}`)?.classList.add('active');
  };
  tabs.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      if (!next) return;
      next.focus();
      activate(next);
    });
  });
}
