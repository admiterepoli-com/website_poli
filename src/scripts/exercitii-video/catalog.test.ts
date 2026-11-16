import { describe, expect, it } from 'vitest';

import { exercitiiInfo, exercitiiMate, type Lesson } from '../../data/exercitii-video';
import { buildCard, canWatch, renderCatalog, type CardContext } from './catalog';

const free: Lesson = { id: 1, docId: 'mate-1', title: 'Numere complexe', access: 'account', statement: 'x' };
const plus: Lesson = {
  id: 3,
  docId: 'mate-3',
  title: 'Integrală "dificilă"',
  access: 'plus',
  statement: 'a "b"',
};
const ctx = (userLevel: CardContext['userLevel'], videoIds: Record<string, string> = {}): CardContext => ({
  userLevel,
  videoIds,
  email: 'a+b@x.ro',
});

describe('canWatch', () => {
  it('free lessons need an account, Plus lessons need Student Plus', () => {
    expect([canWatch(free, 'none'), canWatch(free, 'account'), canWatch(free, 'plus')]).toEqual([
      false,
      true,
      true,
    ]);
    expect([canWatch(plus, 'none'), canWatch(plus, 'account'), canWatch(plus, 'plus')]).toEqual([
      false,
      false,
      true,
    ]);
  });
});

describe('buildCard', () => {
  it('locks a free lesson for a signed-out visitor with the "Creează cont" button', () => {
    const html = buildCard(free, ctx('none'), 0);
    expect(html).toContain('data-open-auth');
    expect(html).not.toContain('data-ev-open');
  });

  it('puts the encoded Gumroad link with the email on the Plus lock', () => {
    const html = buildCard(plus, ctx('account'), 0);
    const url = 'https://admiterepoli.gumroad.com/l/student-plus-lunar?wanted=true&email=a%2Bb%40x.ro';
    expect(html).toContain(`data-upgrade-url="${encodeURIComponent(url)}"`);
  });

  it('opens only with a video id, and keeps the video id out of the attributes', () => {
    expect(buildCard(plus, ctx('plus'), 0)).not.toContain('data-ev-open');
    const html = buildCard(plus, ctx('plus', { 'mate-3': 'VIDEOID' }), 0);
    expect(html).toContain('data-ev-docid="mate-3"');
    expect(html).toContain('data-ev-title="Integrală &quot;dificilă&quot;"');
    expect(html).toContain('data-ev-statement="a &quot;b&quot;"');
    expect(html).not.toMatch(/data-ev-[a-z]+="VIDEOID"/);
  });
});

describe('renderCatalog', () => {
  it('splits each catalog into the free and the Plus group with the legacy counts', () => {
    for (const list of [exercitiiMate, exercitiiInfo]) {
      const html = renderCatalog(list, ctx('none'));
      expect(html).toContain('<span class="ev-group-count">3 lecții</span>');
      expect(html).toContain('<span class="ev-group-count">15 lecții</span>');
    }
  });
});
