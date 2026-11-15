/**
 * Safety net for the simulation gate. INLINED into the page by GateFallback.astro as a classic
 * script, so it runs even when the ES module bundle fails to load. That is its only purpose.
 *
 * This file is compiled as a classic script (see src/lib/inline-script.ts): no imports, no
 * exports, and it must not rely on anything else on the page running without errors. Ported from
 * the block at the top of the legacy main.js; markup, texts and the timeout are unchanged.
 */
// ── Plasă de siguranţă pentru gate-ul de simulare ────────────────────────────
// #exam-gate şi #exam-content pornesc amândouă ascunse şi sunt afişate abia de
// applyExamGate(), din modulul de autentificare. Dacă modulul ESM nu se încarcă deloc
// (reţea de şcoală, adblocker agresiv, gstatic blocat), nimic nu le mai afişează
// şi pagina rămâne albă la nesfârşit. Scriptul acesta e clasic şi inline, separat
// de modul, deci rulează şi când acela pică.
(function () {
  const GATE_TIMEOUT_MS = 10000;

  function armGateFallback(): void {
    const gate = document.getElementById('exam-gate');
    const content = document.getElementById('exam-content');
    if (!gate || !content) return;

    setTimeout(function () {
      const isHidden = (el: HTMLElement): boolean => getComputedStyle(el).display === 'none';
      // Gate-ul şi-a făcut treaba (a afişat mesajul sau conţinutul) — nu ne băgăm.
      if (!isHidden(gate) || !isHidden(content)) return;

      console.error(
        '[ExamGate] Nimic afişat după ' + GATE_TIMEOUT_MS + 'ms — probabil firebase-auth.js nu s-a încărcat.',
      );
      gate.innerHTML =
        '<div class="exam-gate-inner">' +
        '<div class="exam-gate-icon">⚠️</div>' +
        '<h2 class="exam-gate-title">Nu am putut verifica accesul</h2>' +
        '<p class="exam-gate-desc">Conexiunea către serverul de autentificare a eşuat.<br>' +
        'Reîncarcă pagina. Dacă se repetă, dezactivează extensiile de blocare pentru ' +
        'admiterepoli.com sau încearcă alt browser ori reţea.</p>' +
        '<div class="exam-gate-actions">' +
        '<button class="exam-gate-btn" onclick="location.reload()">Reîncarcă pagina</button>' +
        '<a class="exam-gate-btn exam-gate-btn-outline" href="./contact">Scrie-ne</a>' +
        '</div>' +
        '</div>';
      gate.style.display = '';
    }, GATE_TIMEOUT_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armGateFallback);
  } else {
    armGateFallback();
  }
})();
