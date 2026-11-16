/**
 * Simulare 26 Martie 2026: data of the legacy page simulare-2026-03-26.html (its `problemsInfo` and
 * `problemsMate` arrays, extracted verbatim). Free simulation without a gate and
 * without track selection; the result is saved under the page slug.
 */
import { defineSimulation, INFO, LEGACY_COUNTDOWN_TIMER, LEGACY_RULES, MATE } from './_schema';

const info = {
  ...INFO,
  problems: [
    {
      statement:
        'Se consideră următorul cod C++:\n    <pre><code class="cpp">int g(int n) {\n      if (n <= 0) return 0;\n      return n + f(n - 1);\n    }\n    int f(int n) {\n      if (n <= 0) return 1;\n      return n * g(n - 1);\n    }</code></pre>\n    Cât este <code>f(3)</code>?',
      options: ['a) 9', 'b) 12', 'c) 15', 'd) 6', 'e) 3', 'f) 18'],
      correct: 'd',
    },
    {
      statement:
        'Care dintre următoarele expresii C/C++ este echivalentă cu afirmația: „Anul <code>an</code> (număr natural) este bisect” (un an este bisect dacă este divizibil cu 400, SAU este divizibil cu 4 dar nu și cu 100)?',
      options: [
        'a) (an % 4 == 0) && (an % 100 != 0 || an % 400 == 0)',
        'b) an % 4 == 0 && an % 100 != 0 && an % 400 == 0',
        'c) (an % 4 == 0 || an % 100 != 0) && an % 400 == 0',
        'd) an % 400 == 0 || (an % 4 == 0 && an % 100 != 0)',
        'e) an % 4 == 0 || an % 400 == 0',
        'f) (an % 4 == 0 && an % 100 == 0) || an % 400 == 0',
      ],
      correct: 'd',
    },
    {
      statement:
        'Se consideră o matrice cu 4 linii și 4 coloane. În câte moduri putem plasa 4 ture de șah astfel încât să nu se atace reciproc (niciuna să nu fie pe aceeași linie sau coloană cu alta)?',
      options: ['a) 256', 'b) 64', 'c) 16', 'd) 24', 'e) 12', 'f) 4'],
      correct: 'd',
    },
    {
      statement:
        'Într-un graf neorientat bipartit complet cu partițiile de dimensiuni \\( x \\) și \\( y \\), numărul de muchii este 24. Știind că \\( x \\neq y \\), care este numărul maxim de noduri pe care îl poate avea graful?',
      options: ['a) 10', 'b) 11', 'c) 25', 'd) 14', 'e) 24', 'f) 12'],
      correct: 'c',
    },
    {
      statement:
        'Determinați complexitatea timp pentru următoarea funcție, în funcție de <code>n</code> (număr natural strict pozitiv):\n    <pre><code class="cpp">void mister(int n) {\n      int k = 0, i, j;\n      for (i = n; i > 0; i = i / 2) {\n        for (j = 1; j <= i; j++) {\n          k++;\n        }\n      }\n    }</code></pre>',
      options: [
        'a) \\( \\mathcal{O}(n \\log n) \\)',
        'b) \\( \\mathcal{O}(n) \\)',
        'c) \\( \\mathcal{O}(n^2) \\)',
        'd) \\( \\mathcal{O}(\\log n) \\)',
        'e) \\( \\mathcal{O}(n\\sqrt{n}) \\)',
        'f) \\( \\mathcal{O}(1) \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        'Fie o matrice pătratică M cu 50 linii și 50 coloane, numerotate de la 0 la 49. Elementele sunt inițializate cu <code>M[i][j] = i + j</code>. Cât este suma elementelor aflate strict deasupra diagonalei prinpiale?',
      options: ['a) 61250', 'b) 59800', 'c) 60025', 'd) 58800', 'e) 57600', 'f) 62500'],
      correct: 'c',
    },
    {
      statement:
        'O dronă autonomă trebuie să urce un puț de ventilație cu o înălțime de exact 10 metri, pornind de la sol (metrul 0). Drona are 3 trepte de viteză care îi permit să urce brusc fie 1, 2 sau 3 metri dintr-o singură mișcare. <br><br>\n        Pentru a preveni supraîncălzirea motorului, softul dronei are o regulă strictă: drona <b>nu</b> are voie să folosească aceeași distanță de urcare de două ori la rând (exemplu: dacă a urcat 2 metri, următoarea urcare trebuie să fie obligatoriu de 1 metru sau de 3 metri).<br><br>\n        În câte moduri distincte (ca secvență de mișcări) poate ajunge drona exact la metrul 10?',
      options: ['a) 34', 'b) 27', 'c) 41', 'd) 24', 'e) 55', 'f) 38'],
      correct: 'b',
    },
    {
      statement:
        'Analizați următorul program C++:\n    <pre><code class="cpp">#include &lt;iostream&gt;\n#include &lt;string.h&gt;\nusing namespace std;\n\nint main() {\n  char dest[20] = "Automatica";\n  char sursa[] = "CTI";\n\n  strncpy(dest + 4, sursa, 5);\n\n  cout &lt;&lt; dest &lt;&lt; " "; \n  cout &lt;&lt; dest + 9;\n  return 0;\n}</code></pre>\n    Ce va afișa programul pe ecran?',
      options: [
        'a) AutoCTIica ca',
        'b) AutoCTI ca',
        'c) AutoCTI ica',
        'd) AutoCTI a',
        'e) Eroare de compilare',
        'f) Comportament nedefinit',
      ],
      correct: 'd',
    },
    {
      statement:
        'Analizați următorul fragment de cod C++. Știind că apelul inițial este <code>f(1, n, x)</code>, unde <code>n</code> este un număr natural nenul inițializat anterior, ce algoritm clasic implementează acest cod?\n    <pre><code class="cpp">bool valid(int k, int x[20]) {\n      int i = 1;\n      while (i &lt; k) {\n        if (x[i] == x[k]) return false;\n        i++;\n      }\n      return true;\n    }\n\nvoid f(int k, int n, \n       int x[20]) {\n  for (int i = 1; i &lt; n; i++) {\n    x[k] = i;\n    if (valid(k, x) && k == n) {\n      int j;\n      for (j = 1; j &lt;= n; j++)\n        cout &lt;&lt; x[j];\n      cout &lt;&lt; "\\n";\n    } else if (valid(k, x)) {\n      f(k + 1, n, x);\n    }\n  }\n}</code></pre>',
      options: [
        'a) Generarea aranjamentelor',
        'b) Produsul cartezian',
        'c) Generarea combinărilor',
        'd) Generarea permutărilor',
        'e) Generarea submulțimilor',
        'f) Generarea partițiilor unei mulțimi',
      ],
      correct: 'd',
    },
    {
      statement:
        'Urmăriți codul C++ de mai jos care simulează o cursă pe o pistă circulară de lungime <code>n</code>:\n    <pre><code class="cpp">int cursa(int poz_t, int poz_i, \n          int pasi, int n) {\n  if (pasi > 0 && poz_t == poz_i) {\n    return pasi;\n  }\n    \n  int next_t = (poz_t + 1) % n;\n  int next_i = (poz_i + 3) % n;\n    \n  return cursa(next_t, next_i, \n               pasi + 1, n);\n}</code></pre>\n    Dacă funcția de mai sus este apelată inițial cu <code>cursa(0, 0, 0, n)</code>, care dintre următoarele expresii descrie corect valoarea returnată de funcție, strict în funcție de <code>n</code> (unde \\( n \\ge 2 \\) este un număr natural par)?',
      options: [
        'a) \\( \\frac{n}{2} \\)',
        'b) \\( n \\)',
        'c) \\( 2n \\)',
        'd) \\( n - 1 \\)',
        'e) \\( \\frac{n}{3} \\)',
        'f) \\( \\frac{n}{2} + 1 \\)',
      ],
      correct: 'a',
    },
  ],
} as const;

const mate = {
  ...MATE,
  problems: [
    {
      statement:
        'Suma valorilor reale ale lui x pentru care numerele \\( x-1 \\), \\( x+1 \\) și \\( 2x+5 \\) sunt termeni consecutivi ai unei progresii geometrice este:',
      options: ['a) 1', 'b) -1', 'c) 2', 'd) -3', 'e) 0', 'f) -6'],
      correct: 'b',
    },
    {
      statement:
        'Fie numărul complex \\( z \\in \\mathbb{C} \\) care verifică relația: \\( z+\\frac{1}{z}=\\sqrt{3} \\). Să se calculeze valoarea expresiei: \\( E=\\left(z^{2026}+\\frac{1}{z^{2026}}\\right)^{2}+\\left(z^{2027}+\\frac{1}{z^{2027}}\\right)^{2} \\)',
      options: ['a) 0', 'b) 1', 'c) 2', 'd) 3', 'e) 4', 'f) -1'],
      correct: 'e',
    },
    {
      statement: 'Minimul funcției \\( f(x)=x^{x} \\), definită pentru \\( x \\in (0,\\infty) \\) este:',
      options: [
        'a) e',
        'b) \\( \\frac{1}{e} \\)',
        'c) \\( e^{-1/e} \\)',
        'd) 1',
        'e) 0',
        'f) \\( -\\frac{1}{e} \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        'Considerăm următoarele două funcții definite pe domeniul \\( x>0 \\): \\( f(x)=\\frac{e^{x}}{x^{e}} \\) și \\( g(x)=\\frac{e^{-x^{2}+4x-2}}{x^{e}} \\). Pe care dintre următoarele intervale este \\( g(x)>f(x) \\)?',
      options: [
        'a) (0,1)',
        'b) (1,2)',
        'c) (2, e)',
        'd) \\( (0,1) \\cup (2,\\infty) \\)',
        'e) Nu există un astfel de interval.',
        'f) (1,e)',
      ],
      correct: 'b',
    },
    {
      statement:
        'Se consideră sistemul de ecuații: \\( \\begin{cases} x+my+z=1 \\\\ x+y+mz=2 \\\\ mx+y+z=-1 \\end{cases} \\) unde \\( m \\in \\mathbb{R} \\). Mulțimea valorilor lui \\( m \\) pentru care sistemul este incompatibil este:',
      options: ['a) {-1,2}', 'b) {1,-2}', 'c) {1}', 'd) {-2}', 'e) {0,1}', 'f) {-1,1}'],
      correct: 'b',
    },
    {
      statement:
        'Valoarea integralei \\( \\int_{0}^{\\frac{\\pi}{2}}\\frac{\\sin x}{\\sin x+\\cos x}dx \\) este:',
      options: [
        'a) \\( \\frac{\\pi}{2} \\)',
        'b) \\( \\frac{\\pi}{4} \\)',
        'c) \\( \\pi \\)',
        'd) 0',
        'e) 1',
        'f) \\( \\frac{\\pi}{3} \\)',
      ],
      correct: 'b',
    },
    {
      statement: 'Soluția ecuației \\( \\log_{2}(x-1)=\\log_{4}(x+1) \\) este:',
      options: ['a) 0 și 3', 'b) 3', 'c) 0', 'd) 4', 'e) 2', 'f) nu are soluții'],
      correct: 'b',
    },
    {
      statement:
        'Se consideră un număr natural \\( n \\ge 2 \\). Să se calculeze valoarea următoarei sume: \\( S_{n}=\\sum_{k=1}^{n}(-1)^{k-1}\\cdot k\\cdot C_{n}^{k} \\)',
      options: ['a) n', 'b) \\( 2^{n-1} \\)', 'c) 0', 'd) \\( (-1)^{n} \\)', 'e) n!', 'f) 1'],
      correct: 'c',
    },
    {
      statement:
        'Fie o funcție derivabilă astfel încât \\( f(2^{x}+3^{x})=x^{2}+x+1 \\) pentru orice \\( x \\in \\mathbb{R} \\). Valoarea derivatei \\( f^{\\prime}(2) \\) este:',
      options: [
        'a) \\( \\frac{1}{\\ln 6} \\)',
        'b) \\( \\ln 6 \\)',
        'c) 1',
        'd) 0',
        'e) \\( \\frac{1}{\\ln 5} \\)',
        'f) e',
      ],
      correct: 'a',
    },
    {
      statement: 'Să se calculeze limita șirului: \\( \\lim_{n \\rightarrow \\infty}n(\\sqrt{n^{2}+2}-n) \\)',
      options: ['a) 1', 'b) 0', 'c) \\( \\frac{1}{2} \\)', 'd) 2', 'e) \\( \\infty \\)', 'f) nu există'],
      correct: 'a',
    },
  ],
} as const;

export default defineSimulation({
  id: 'simulare-2026-03-26',
  access: { kind: 'free' },
  trackSelection: false,
  tracks: [
    {
      id: 'info',
      sections: [info, mate],
      resultId: 'simulare-2026-03-26',
      resultTitle: 'Simulare 26 Martie 2026',
    },
  ],
  ...LEGACY_RULES,
  timer: LEGACY_COUNTDOWN_TIMER,
  resultsEndpoint:
    'https://script.google.com/macros/s/AKfycbzOIZUrZfX7-21hGQjsmJV9rAvfNhAb3C-iofycgmRtjAjO7NCZ5CZ5MTW4VXTkND0K/exec',
});
