/**
 * Simulare 21 Martie 2026: data of the legacy page simulare-2026-03-21.html (its `problemsInfo` and
 * `problemsMate` arrays, extracted verbatim). Free simulation without a gate and
 * without track selection; the result is saved under the page slug.
 */
import { defineSimulation, INFO, LEGACY_COUNTDOWN_TIMER, LEGACY_RULES, MATE } from './_schema';

const info = {
  ...INFO,
  problems: [
    {
      statement:
        'Ce va afisa urmatoarea secventa de cod C la finalizarea executiei, stiind ca bucla se opreste imediat ce unul dintre vectori a fost parcurs complet?\n    <pre><code class="c">int a[] = {2, 4, 6, 8};\n    int b[] = {1, 3, 5};\n    int c[10];\n    int i=0, j=0, k=0;\n\n    while(i < 4 && j < 3) {\n    if(a[i] < b[j])\n        c[k++] = a[i++];\n    else\n        c[k++] = b[j++];\n    }\n    printf("%d", a[i]);</code></pre>',
      options: ['a) 8', 'b) 4', 'c) 5', 'd) 6', 'e) 2', 'f) 0'],
      correct: 'd',
    },
    {
      statement:
        'Recursivitate - Numararea apelurilor (Arbore de executie). Cate apeluri ale functiei <code>g</code> se executa <b>in total</b> (incluzand apelul initial) pentru evaluarea expresiei <code>g(5)</code>?\n    <pre><code class="cpp">int g(int n) {\n    if (n <= 1) return 1;\n    return g(n-1) + g(n-2) + g(n-3);\n    }</code></pre>',
      options: ['a) 13', 'b) 15', 'c) 9', 'd) 25', 'e) 11', 'f) 7'],
      correct: 'd',
    },
    {
      statement:
        'Dinamica pe siruri binare. Cate siruri binare de lungime <code>n = 8</code> pot fi construite, stiind ca este strict interzis ca sirul sa contina trei cifre de \'1\' pe pozitii consecutive (secventa "111" nu are voie sa apara)?',
      options: ['a) 256', 'b) 149', 'c) 128', 'd) 81', 'e) 164', 'f) 144'],
      correct: 'b',
    },
    {
      statement:
        'Teoria numerelor - Divizori. Ce afiseaza urmatoarea secventa pentru <code>n = 16</code>?\n    <pre><code class="c">int n = 16, nr = 0;\n    for(int i = 1; i*i <= n; i++){\n    if(n % i == 0) {\n        nr++;\n        if(i * i != n) nr++;\n    }\n    }\n    printf("%d", nr);</code></pre>',
      options: ['a) 3', 'b) 4', 'c) 5', 'd) 6', 'e) 2', 'f) 8'],
      correct: 'c',
    },
    {
      statement:
        'Indexare succesiva in vectori. Fie vectorul \\( v = \\{4, 7, 1, 5, 8, 9, 4, 2, 1, 1\\} \\). Primul element este pe pozitia 0. Care este valoarea expresiei \\( v[v[v[0]]] + v[v[0]] + v[0] \\)?',
      options: ['a) 20', 'b) 13', 'c) 14', 'd) 6', 'e) 11', 'f) 17'],
      correct: 'b',
    },
    {
      statement:
        'Tren: O garnitura de tren este formata din N vagoane. Mecanicul primeste ordin sa inverseze complet ordinea vagoanelor.\n    <pre><code class="c">struct Vagon {\n    int id;\n    struct Vagon* next;\n    };</code></pre>\n\n    <pre><code class="c">struct Vagon* Inverseaza(\n        struct Vagon* prim) {\n    struct Vagon* cur = prim;\n    struct Vagon* ant = NULL;\n    struct Vagon* vit = NULL;\n    while (cur != NULL) {\n        vit = (*cur).next;\n        // [ ... LINIE LIPSA ... ]\n        ant = cur;\n        cur = vit;\n    }\n    return ant;\n    }</code></pre>\n    Care este instructiunea corecta care trebuie plasata pe linia lipsa si care este complexitatea de timp?',
      options: [
        'a) (*ant).next = cur; \\( \\mathcal{O}(N) \\)',
        'b) (*cur).next = ant; \\( \\mathcal{O}(N^2) \\)',
        'c) (*vit).next = ant; \\( \\mathcal{O}(\\log N) \\)',
        'd) (*cur).next = ant; \\( \\mathcal{O}(N) \\)',
        'e) (*cur).next = vit; \\( \\mathcal{O}(1) \\)',
        'f) Niciuna din cele de mai sus',
      ],
      correct: 'd',
    },
    {
      statement:
        'Un set de 10 popice de bowling, numerotate de la 1 la 10, trebuie aranjate în formația standard triunghiulară: un popic pe rândul 1, două pe rândul 2, trei pe rândul 3 și patru pe rândul 4, așezate ca în imaginea alăturată. Pentru un joc special, organizatorii impun următoarele două reguli stricte de așezare:\n        <div style="text-align: center; margin: 1.5rem 0;">\n            <img src="./images/triunghi.png" style="width: 35%; max-width: 250px;" alt="Diagramă popice">\n        </div>\n        1. Popicele cu numerele 1, 3, 5 și 7 <b>nu</b> au voie să fie adiacente (nu se pot atinge direct între ele).<br><br>\n        2. Dacă adunăm numerele de pe toate <b>popicele pare care sunt vecine direct</b> cu popicul 10, suma lor trebuie să fie exact 10. (Popicele impare vecine cu 10 sunt ignorate la acest calcul).<br><br>\n        În câte moduri distincte pot fi aranjate cele 10 popice astfel încât să respecte ambele reguli simultan?',
      options: [
        'a) \\(4! \\times 6!\\)',
        'b) 0',
        'c) 3456',
        'd) 1152',
        'e) \\(4! \\times 2 \\times C_6^2\\)',
        'f) Niciuna din variantele de mai sus',
      ],
      correct: 'c',
    },
    {
      statement:
        'Considerati urmatoarea functie recursiva in C++:\n    <pre><code class="cpp">int procesare(char* sir,\n                bool primul) {\n    char* token;\n    if (primul)\n        token = strtok(sir, "-");\n    else\n        token = strtok(NULL, "-");\n    if (token == NULL) return 0;\n    if (strcmp(token, "BACK") == 0)\n        return procesare(sir, true);\n    return 1 + procesare(sir, false);\n    }</code></pre>\n    Sirul initial este <code>"A-B-BACK-C"</code>, apelul initial este <code>procesare(sir, true)</code>. Cate apeluri au loc si ce valoare returneaza?',
      options: [
        'a) Bucleaza la infinit',
        'b) 5 apeluri, rezultatul va fi 3',
        'c) 4 apeluri, rezultatul va fi 2',
        'd) 6 apeluri, rezultatul va fi 4',
        'e) 2 apeluri, rezultatul va fi 0',
        'f) 3 apeluri, rezultatul va fi 1',
      ],
      correct: 'b',
    },
    {
      statement:
        'Fie doi vectori \\( v_1 \\) si \\( v_2 \\) cu <code>n</code> si <code>m</code> elemente. \\( v_1 \\) sortat descrescator, \\( v_2 \\) crescator. Matricea \\( A[i][j] = v_1[i] + v_2[j] \\). Care este complexitatea optima de cautare a unei valori X in aceasta matrice?',
      options: [
        'a) \\( \\mathcal{O}(\\log(nm)) \\)',
        'b) \\( \\mathcal{O}(n \\log(m)) \\)',
        'c) \\( \\mathcal{O}(nm) \\)',
        'd) \\( \\mathcal{O}(1) \\)',
        'e) \\( \\mathcal{O}(n + m) \\)',
        'f) \\( \\mathcal{O}(m^2 \\cdot \\log(n)) \\)',
      ],
      correct: 'e',
    },
    {
      statement:
        'Graf neorientat cu \\( n = 8 \\) noduri si muchiile:\n    <code>M = {(1,2), (1,5), (2,3), (2,5), (3,4), (4,5), (5,6), (6,7), (7,8), (6,8)}</code>.\n    Numarul de noduri care au gradul un numar par este:',
      options: ['a) 2', 'b) 4', 'c) 7', 'd) 6', 'e) 5', 'f) 1'],
      correct: 'd',
    },
  ],
} as const;

const mate = {
  ...MATE,
  problems: [
    {
      statement: '1. Cât este \\( C_m^{m-4} \\) știind că \\( A_m^4 = 120 \\)?',
      options: ['a) 1', 'b) 5', 'c) 120', 'd) 24', 'e) 10', 'f) 4'],
      correct: 'b',
    },
    {
      statement:
        '2. Fie \\( S \\) mulțimea soluțiilor reale ale ecuației: \\( \\log_{x+1}(2x^2-3x+1)=1 \\). Să se calculeze produsul elementelor mulțimii \\( S \\). (Dacă mulțimea are un singur element, produsul este considerat egal cu acel element).',
      options: [
        'a) \\( 0 \\)',
        'b) \\( 2 \\)',
        'c) \\( \\frac{1}{2} \\)',
        'd) \\( -2 \\)',
        'e) \\( 1 \\)',
        'f) \\( S = \\emptyset \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        '3. Să se determine restul împărțirii polinomului \\( P(X)=(X+1)^{2026}+X^{2026}+1 \\) la polinomul \\( Q(X)=X^2+X+1 \\).',
      options: ['a) \\( X+1 \\)', 'b) \\( 2X+1 \\)', 'c) 0', 'd) 2', 'e) \\( X+2 \\)', 'f) 1'],
      correct: 'c',
    },
    {
      statement:
        '4. Fie \\( f: \\mathbb{R} \\to \\mathbb{R} \\) o funcție care satisface relația \\( f(x)+2f(1-x)=3x \\) pentru orice \\( x \\in \\mathbb{R} \\). Calculați \\( f(2) \\).',
      options: ['a) -2', 'b) 4', 'c) 2', 'd) -4', 'e) 0', 'f) -6'],
      correct: 'd',
    },
    {
      statement:
        '5. Fie matricea \\( A = \\begin{pmatrix} 11 & 10 \\\\ -12 & -11 \\end{pmatrix} \\in \\mathcal{M}_2(\\mathbb{R}) \\). Care este valoarea determinantului matricei \\( A^{2026} \\)?',
      options: ['a) -1', 'b) 0', 'c) 1', 'd) 2', 'e) 2026', 'f) -2026'],
      correct: 'c',
    },
    {
      statement:
        '6. Fie numărul complex \\( z = a + bi \\), unde \\( a, b \\in \\mathbb{R} \\), astfel încât \\( z^2 = z \\). Câte perechi de soluții \\( (a, b) \\) are această problemă?',
      options: ['a) 0', 'b) 1', 'c) 2', 'd) 3', 'e) 4', 'f) O infinitate'],
      correct: 'c',
    },
    {
      statement:
        "7. Fie funcția \\( f : \\mathbb{R} \\to \\mathbb{R} \\) derivabilă de cel puțin două ori pe \\( \\mathbb{R} \\). Aflați limita: \\( L = \\lim_{x \\to 0} \\frac{\\int_0^x f(t) dt}{\\int_0^{x^2+2x} f(t) dt} \\) știind că \\( f'(0) = 0 \\) și \\( f''(0) \\neq 0 \\).",
      options: [
        'a. \\( L \\in \\{\\frac{1}{4}, \\frac{1}{2}\\} \\)',
        'b. \\( L \\in \\{\\frac{1}{8}, \\frac{1}{4}\\} \\)',
        'c. \\( L \\in \\{\\frac{1}{8}, \\frac{1}{2}\\} \\)',
        'd. \\( L = \\frac{1}{8} \\)',
        'e. \\( L = \\frac{1}{2} \\)',
        'f. Limita nu există',
      ],
      correct: 'c',
    },
    {
      statement:
        '8. Calculați limita la dreapta: \\( L = \\lim_{x \\to 3, x > 3} \\left[ \\ln\\left(1 + \\frac{1}{e^{\\frac{1}{x-3}}}\\right) \\cdot e^{\\frac{1}{x-3}} \\right] \\).',
      options: ['a) 0', 'b) 1', 'c) e', 'd) \\( \\infty \\)', 'e) \\( \\frac{1}{e} \\)', 'f) Nu există'],
      correct: 'b',
    },
    {
      statement:
        '9. Câte soluții reale \\( (x, y) \\) are sistemul următor și în ce interval se află valoarea lui \\( x \\)?\n\\[ \\begin{cases} \\ln^3(x) + (y + 1)^2 = 0 \\\\ x - y = 1 \\end{cases} \\]',
      options: [
        'a) O singură soluție, cu \\( x \\in (0, 1) \\).',
        'b) Două soluții, ambele având \\( x \\in (0, 1) \\).',
        'c) Două soluții, una cu \\( x < 0 \\) și alta cu \\( x > 0 \\).',
        'd) O singură soluție, cu \\( x > 1 \\).',
        'e) Nicio soluție.',
        'f) Două soluții, ambele având \\( x > 1 \\).',
      ],
      correct: 'a',
    },
    {
      statement:
        '10. Să se calculeze valoarea produsului: \\( P = \\left(1 - \\frac{1}{2^2}\\right) \\left(1 - \\frac{1}{3^2}\\right) \\dots \\left(1 - \\frac{1}{2026^2}\\right) \\)',
      options: [
        'a) \\( \\frac{2027}{4052} \\)',
        'b) \\( \\frac{1}{2} \\)',
        'c) \\( \\frac{2025}{4052} \\)',
        'd) 0',
        'e) 1',
        'f) \\( \\frac{1013}{2026} \\)',
      ],
      correct: 'a',
    },
  ],
} as const;

export default defineSimulation({
  id: 'simulare-2026-03-21',
  access: { kind: 'free' },
  trackSelection: false,
  tracks: [
    {
      id: 'info',
      sections: [info, mate],
      resultId: 'simulare-2026-03-21',
      resultTitle: 'Simulare 21 Martie 2026',
    },
  ],
  ...LEGACY_RULES,
  timer: LEGACY_COUNTDOWN_TIMER,
  resultsEndpoint:
    'https://script.google.com/macros/s/AKfycbzQy9zBQVR_ryP5zfpAhY0fGjyf2oP_OstLfztdhTmpTSY47FuQgGhDy17NL_E-CfP3fQ/exec',
});
