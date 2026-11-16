/**
 * Simulare #4 — Mate + … (Iulie 2026): data of the legacy page simulare-2026-07-21.html (its `allProblems.info`,
 * `allProblems.fizica` and `problemsMate` arrays, extracted verbatim). Paid simulation behind the
 * exam gate, with the choice between Mate + Informatică and Mate + Fizică.
 */
import { defineSimulation, FIZICA, INFO, LEGACY_DEADLINE_TIMER, LEGACY_RULES, MATE } from './_schema';

const info = {
  ...INFO,
  problems: [
    {
      statement:
        '<b>Definiții de structuri.</b> Se consideră următoarele definiții de structuri și inițializarea de mai jos:\n    <pre><code class="cpp">struct Component {\n    int powerLevel;\n    bool isActive;\n};\nstruct Device {\n    int deviceID;\n    char categoryCode;\n    Component core;\n};\n\n// Initializare\nDevice d;\nd.deviceID = 404;\nd.categoryCode = \'B\';\nd.core.powerLevel = 0;\nd.core.isActive = false;</code></pre>\n    Fiecare operație de mai jos se evaluează <b>independent</b>, pornind de fiecare dată de la inițializarea de mai sus:\n    <pre><code class="cpp">1: d.categoryCode = d.core.isActive + 64;\n2: d.deviceID = d.core;\n3: d.core.isActive = d.deviceID;\n4: d.core = d.deviceID;\n5: d.core.powerLevel = d.categoryCode - \'A\';</code></pre>\n    Care dintre următoarele afirmații este adevărată cu privire la compilare?',
      options: [
        'a) Eroare de compilare la Operația 1 și Operația 3',
        'b) Eroare de compilare la Operația 2 și Operația 5',
        'c) Eroare de compilare doar la Operația 4',
        'd) Eroare de compilare la Operația 2 și Operația 4',
        'e) Eroare de compilare la Operația 1, Operația 2 și Operația 4',
        'f) Codul se compilează fără nicio eroare',
      ],
      correct: 'd',
    },
    {
      statement:
        '<b>Analiză buclă while.</b> Ce valoare va afișa următorul program scris în C++?\n    <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\nint main() {\n    int x = 0;\n    int y = 5;\n    int pasi = 0;\n    while (x != y) {\n        x = (2 * x + 1) % 17;\n        y = (3 * y + 2) % 17;\n        pasi++;\n    }\n    cout &lt;&lt; pasi;\n    return 0;\n}</code></pre>',
      options: [
        'a) 8',
        'b) 11',
        'c) 16',
        'd) 17',
        'e) 24',
        'f) Programul va intra într-o buclă infinită (nu se va opri).',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Parcurgere matrice pe coloane.</b> Se consideră funcția de mai jos, care primește o matrice <code>a</code> cu <code>n</code> linii și <code>m</code> coloane (unde <code>m</code> este strict par), ambele numerotate începând de la indexul 0. Funcția trebuie să afișeze elementele parcurgând mai întâi <b>coloanele de index par</b> de sus în jos (de la stânga la dreapta). După ce nu mai există coloane la dreapta, trebuie să parcurgă restul coloanelor (cele <b>impare</b>) de la dreapta la stânga, fiecare coloană fiind parcursă de jos în sus.\n    <pre><code class="cpp">void parcurgereMatrice(int a[100][100],\n                       int n, int m) {\n    if (m % 2 != 0) return;\n\n    // Pasul 1: coloanele pare, de sus in jos\n    for (int j = 0; j &lt; m; j += 2) {\n        for (int i = 0; i &lt; n; i++) {\n            cout &lt;&lt; a[i][j] &lt;&lt; " ";\n        }\n    }\n\n    // Pasul 2: restul coloanelor (cele impare)\n    // --- COMPLETEAZA AICI (1) ---\n    // --- COMPLETEAZA AICI (2) ---\n            cout &lt;&lt; a[i][j] &lt;&lt; " ";\n        }\n    }\n}</code></pre>\n    Care dintre următoarele perechi de instrucțiuni trebuie plasate în zona marcată (liniile (1) și (2)) pentru ca funcția să realizeze corect a doua parte a parcurgerii?',
      options: [
        'a) (1) <code>for (int j = m - 1; j &gt;= 1; j -= 2) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int i = n - 1; i &gt;= 0; i--) {</code>',
        'b) (1) <code>for (int i = n - 1; i &gt;= 0; i--) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int j = m - 1; j &gt;= 1; j -= 2) {</code>',
        'c) (1) <code>for (int j = 1; j &lt; m; j += 2) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int i = n - 1; i &gt;= 0; i--) {</code>',
        'd) (1) <code>for (int j = m - 2; j &gt;= 0; j -= 2) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int i = n - 1; i &gt;= 0; i--) {</code>',
        'e) (1) <code>for (int j = m; j &gt; 0; j -= 2) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int i = n; i &gt; 0; i--) {</code>',
        'f) (1) <code>for (int j = m - 1; j &gt; 0; j--) {</code><br>&nbsp;&nbsp;&nbsp;(2) <code>for (int i = n - 1; i &gt; 0; i--) {</code>',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Funcție recursivă.</b> Se consideră următorul program C++:\n    <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\n\nvoid procesare(int&amp; x) {\n    if (x &lt;= 1) {\n        return;\n    }\n    x = x / 2;\n    procesare(x);\n    x = x * 2;\n    cout &lt;&lt; x &lt;&lt; " ";\n}\n\nint main() {\n    int n = 50;\n    procesare(n);\n    return 0;\n}</code></pre>\n    Care este lungimea celei mai lungi secvențe de numere nenule (strict pozitive) afișate pe ecran în urma rulării programului?',
      options: [
        'a) 6',
        'b) 0',
        'c) 5',
        'd) 25',
        'e) Eroare de compilare: modificarea parametrului-referință înainte de apelul recursiv este interzisă.',
        'f) 4',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Arbore generic complet.</b> Se consideră un arbore generic complet cu 2500 de noduri, în care un nod poate avea oricâți fii. Nodurile sunt parcurse în lățime (pe niveluri, de la stânga la dreapta) și numerotate cu numere naturale consecutive, începând de la rădăcină, care este nodul 1 și se află pe nivelul 1.<br><br>\n        Regula de ramificare este următoarea: orice nod etichetat cu valoarea \\( k \\) are exact \\( k+1 \\) descendenți direcți (fii). Astfel, nodul 1 are 2 fii, nodul 2 are 3 fii, nodul 3 are 4 fii și așa mai departe, fiii fiind atribuiți în ordinea crescătoare a etichetelor, până la epuizarea celor 2500 de noduri.<br><br>\n        Câte niveluri are, în total, acest arbore?',
      options: ['a) 5', 'b) 6', 'c) 4', 'd) 8', 'e) 7', 'f) 9'],
      correct: 'b',
    },
    {
      statement:
        '<b>Grafuri euleriene și hamiltoniene.</b> Considerăm grafuri neorientate <b>simple</b> (fără bucle și fără muchii multiple) cu 5 noduri <b>etichetate</b> (numerotate de la 1 la 5).<br><br>\n        Reamintim: un graf este <b>eulerian</b> dacă este conex și toate nodurile au grad par (echivalent: admite un circuit eulerian); un graf este <b>hamiltonian</b> dacă conține un ciclu care trece prin fiecare nod exact o dată.<br><br>\n        Câte grafuri cu 5 noduri etichetate sunt simultan euleriene și hamiltoniene?',
      options: ['a) 12', 'b) 13', 'c) 24', 'd) 1', 'e) 0', 'f) 120'],
      correct: 'b',
    },
    {
      statement:
        '<b>Prelucrare șiruri de caractere.</b> Ce se va afișa pe ecran în urma rulării programului?\n    <pre><code class="cpp">#include &lt;iostream&gt;\n#include &lt;string.h&gt;\nusing namespace std;\nint main() {\n    char s[] = "automatica_calculatoare_cti";\n    char ref[] = "calculatoare";\n    char rez[50] = "";\n    char *t = strtok(s, "_");\n    while (t != NULL) {\n        int comp = strcmp(t, ref);\n        if (comp &lt; 0) {\n            strcat(rez, t + 4);\n        } else if (comp &gt; 0) {\n            char m[10];\n            strcpy(m, t);\n            m[strlen(t) - 1] = \'\\0\';\n            strcat(rez, m);\n        } else {\n            rez[2] = \'\\0\';\n        }\n        t = strtok(NULL, "_");\n    }\n    cout &lt;&lt; rez;\n    return 0;\n}</code></pre>',
      options: [
        'a) <code>maticact</code>',
        'b) <code>mact</code>',
        'c) <code>omct</code>',
        'd) <code>ma</code>',
        'e) <code>automatica_calculatoare_cti</code>',
        'f) Eroare de rulare (Segmentation Fault)',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Memoizare Fibonacci.</b> Se consideră următorul program C++:\n    <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\n\nint apeluri = 0;\n\nint fib(int n) {\n    int memo[30] = {0};\n    if (n &lt; 2)\n        return n;\n    if (memo[n] != 0)\n        return memo[n];\n    apeluri++;\n    memo[n] = fib(n - 1) + fib(n - 2);\n    return memo[n];\n}\n\nint main() {\n    fib(12);\n    cout &lt;&lt; apeluri &lt;&lt; endl;\n    return 0;\n}</code></pre>\n    Ce valoare va afișa programul?',
      options: ['a) 11', 'b) 144', 'c) 232', 'd) 233', 'e) 287', 'f) 465'],
      correct: 'c',
    },
    {
      statement:
        '<b>Numărare plăți cu bancnote.</b> Andrei are în portofel exact 3 bancnote de 1 leu, 6 bancnote de 2 lei, 4 bancnote de 5 lei și 5 bancnote de 10 lei (în total 85 de lei). El vrea să plătească suma de 20 de lei folosind numai bancnotele pe care le are, fără a primi rest.<br><br>\n        Două plăți se consideră diferite dacă diferă prin numărul de bancnote folosite din cel puțin un tip (bancnotele de aceeași valoare sunt indistinguibile, iar ordinea în care sunt înmânate nu contează).<br><br>\n        În câte moduri poate Andrei să plătească exact 20 de lei?',
      options: ['a) 9', 'b) 11', 'c) 12', 'd) 15', 'e) 35', 'f) 40'],
      correct: 'c',
    },
    {
      statement:
        '<b>Complexitate — două bucle multiplicative.</b> Analizați următorul fragment de cod:\n    <pre><code class="cpp">for (int i = 1; i &lt;= n; i *= 2)\n    for (int j = 1; j &lt;= i; j *= 2)\n        cout &lt;&lt; "*";</code></pre>\n    Complexitatea de timp este:',
      options: [
        'a) \\( O(n) \\)',
        'b) \\( O(\\log n) \\)',
        'c) \\( O(\\log^2 n) \\)',
        'd) \\( O(n \\log n) \\)',
        'e) \\( O(\\sqrt{n}) \\)',
        'f) \\( O(1) \\)',
      ],
      correct: 'c',
    },
  ],
} as const;

const fizica = {
  ...FIZICA,
  problems: [
    {
      statement:
        '<b>Ciocnire plastică.</b> Un corp de masă \\( m_1 = 2 \\) kg, având viteza \\( v_1 = 6 \\) m/s, lovește plastic (ciocnire perfect inelastică) un corp de masă \\( m_2 = 4 \\) kg aflat în repaus. Energia cinetică pierdută în ciocnire este:',
      options: [
        'a) \\( 12 \\) J',
        'b) \\( 36 \\) J',
        'c) \\( 24 \\) J',
        'd) \\( 0 \\) J',
        'e) \\( 6 \\) J',
        'f) \\( 18 \\) J',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Calorimetrie.</b> Se amestecă \\( m_1 = 200 \\) g de apă la \\( t_1 = 80\\,^{\\circ}\\mathrm{C} \\) cu \\( m_2 = 300 \\) g de apă la \\( t_2 = 20\\,^{\\circ}\\mathrm{C} \\), într-un calorimetru ideal (fără pierderi). Temperatura de echilibru este:',
      options: [
        'a) \\( 50\\,^{\\circ}\\mathrm{C} \\)',
        'b) \\( 40\\,^{\\circ}\\mathrm{C} \\)',
        'c) \\( 44\\,^{\\circ}\\mathrm{C} \\)',
        'd) \\( 60\\,^{\\circ}\\mathrm{C} \\)',
        'e) \\( 44 \\) K',
        'f) \\( 48\\,^{\\circ}\\mathrm{C} \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Rezistență echivalentă.</b> Se consideră circuitul din figura de mai jos. Să se calculeze rezistența echivalentă între punctele \\( A \\) și \\( B \\), știind că \\( R\' = 2R \\).\n    <svg class="fig-svg" viewBox="0 0 560 180" role="img" aria-label="Retea de patru rezistoare intre bornele A si B, cu doua punti conductoare">\n        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n            <path d="M38 90 H80 M140 90 H180 M240 90 H280 M340 90 H380 M440 90 H505"/>\n            <rect x="80" y="76" width="60" height="28"/>\n            <rect x="180" y="76" width="60" height="28"/>\n            <rect x="280" y="76" width="60" height="28"/>\n            <rect x="380" y="76" width="60" height="28"/>\n            <path d="M160 90 V35 H360 V90"/>\n            <path d="M55 90 V150 H260 V90"/>\n            <circle cx="33" cy="90" r="5"/>\n            <circle cx="512" cy="90" r="5"/>\n        </g>\n        <g fill="currentColor">\n            <circle cx="55" cy="90" r="3.5"/>\n            <circle cx="160" cy="90" r="3.5"/>\n            <circle cx="260" cy="90" r="3.5"/>\n            <circle cx="360" cy="90" r="3.5"/>\n        </g>\n        <g fill="currentColor" font-family="Georgia, serif" font-style="italic" font-size="18" text-anchor="middle">\n            <text x="110" y="66">R</text>\n            <text x="210" y="66">R&#8242;</text>\n            <text x="310" y="66">R&#8242;</text>\n            <text x="410" y="66">R</text>\n            <text x="14" y="96">A</text>\n            <text x="536" y="96">B</text>\n        </g>\n    </svg>',
      options: [
        'a) \\( \\dfrac{3R}{2} \\)',
        'b) \\( R \\)',
        'c) \\( \\dfrac{2R}{3} \\)',
        'd) \\( 6R \\)',
        'e) \\( \\dfrac{R}{3} \\)',
        'f) \\( \\dfrac{5R}{2} \\)',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Dinamica corpurilor legate.</b> Două corpuri de mase \\( m_1 = 3 \\) kg și \\( m_2 = 2 \\) kg sunt legate printr-un fir inextensibil și de masă neglijabilă, trecut peste un scripete ideal (fără frecare, fără masă). Sistemul este lăsat liber. Se dă \\( g = 10 \\) m/s\\( ^2 \\). Tensiunea din fir este:\n    <svg class="fig-svg" viewBox="0 0 380 260" role="img" aria-label="Doua corpuri de mase m1 si m2 legate printr-un fir trecut peste un scripete ideal fixat de tavan">\n        <defs>\n            <pattern id="fiz-hatch-c" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">\n                <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" stroke-width="1.3" opacity="0.6"/>\n            </pattern>\n        </defs>\n        <rect x="110" y="18" width="160" height="16" fill="url(#fiz-hatch-c)" stroke="none"/>\n        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n            <path d="M110 34 H270" stroke-width="2.6"/>\n            <path d="M190 34 V52" stroke-width="3"/>\n            <path d="M166 76 A24 24 0 0 1 214 76"/>\n            <path d="M166 76 V150 M214 76 V118"/>\n        </g>\n        <circle cx="190" cy="76" r="24" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2.4"/>\n        <circle cx="190" cy="76" r="2.5" fill="currentColor"/>\n        <rect x="144" y="150" width="44" height="44" fill="#7BA0D9" fill-opacity="0.22" stroke="currentColor" stroke-width="2"/>\n        <rect x="192" y="118" width="44" height="44" fill="#e57373" fill-opacity="0.22" stroke="currentColor" stroke-width="2"/>\n        <g stroke="#4db6ac" fill="#4db6ac">\n            <path d="M118 146 V182" stroke-width="2.2" stroke-linecap="round"/>\n            <polygon points="112,180 118,194 124,180"/>\n            <path d="M262 166 V126" stroke-width="2.2" stroke-linecap="round"/>\n            <polygon points="256,128 262,114 268,128"/>\n        </g>\n        <g font-family="Georgia, serif" font-style="italic" font-size="18" text-anchor="middle">\n            <g fill="currentColor">\n                <text x="166" y="178">m<tspan font-size="12" font-style="normal" dy="4">1</tspan></text>\n                <text x="214" y="146">m<tspan font-size="12" font-style="normal" dy="4">2</tspan></text>\n            </g>\n            <g fill="#4db6ac">\n                <text x="102" y="176">a</text>\n                <text x="278" y="146">a</text>\n            </g>\n        </g>\n    </svg>',
      options: [
        'a) \\( 10 \\) N',
        'b) \\( 50 \\) N',
        'c) \\( 12 \\) N',
        'd) \\( 24 \\) N',
        'e) \\( 30 \\) N',
        'f) \\( 30 \\) kg',
      ],
      correct: 'd',
    },
    {
      statement:
        '<b>Mașină termică Carnot.</b> O mașină termică ideală (Carnot) funcționează între temperaturile \\( t_1 = 227\\,^{\\circ}\\mathrm{C} \\) și \\( t_2 = 27\\,^{\\circ}\\mathrm{C} \\). Randamentul mașinii este:',
      options: [
        'a) \\( 88\\,\\% \\)',
        'b) \\( 11{,}9\\,\\% \\)',
        'c) \\( 50\\,\\% \\)',
        'd) \\( 40\\,\\% \\)',
        'e) \\( 60\\,\\% \\)',
        'f) \\( 100\\,\\% \\)',
      ],
      correct: 'd',
    },
    {
      statement:
        '<b>Mișcare circulară în plan vertical.</b> O bilă legată de un fir de lungime \\( l = 0{,}4 \\) m este rotită în plan vertical. Se dă \\( g = 10 \\) m/s\\( ^2 \\). Viteza minimă pe care trebuie să o aibă bila în punctul cel mai de sus al traiectoriei, pentru ca firul să rămână întins, este:',
      options: [
        'a) \\( 4 \\) m/s',
        'b) \\( 2 \\) m/s',
        'c) \\( \\sqrt{2} \\) m/s',
        'd) \\( 8 \\) m/s',
        'e) \\( 2 \\) m/s\\( ^2 \\)',
        'f) \\( 0{,}4 \\) m/s',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Inel conductor — putere minimă.</b> Un fir conductor omogen este îndoit sub forma unui inel închis. Inelul este alimentat la o sursă de tensiune constantă \\( U = 6 \\) V prin intermediul a două borne, \\( A \\) și \\( B \\), situate pe circumferința sa. Puterea minimă disipată de circuit este \\( P_{\\min} = 36 \\) W. Să se determine rezistența electrică totală a inelului conductor.\n    <svg class="fig-svg" viewBox="0 0 420 205" role="img" aria-label="Inel conductor alimentat prin doua borne A si B situate pe circumferinta sa">\n        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">\n            <circle cx="210" cy="112" r="76"/>\n            <path d="M135.7 96.2 Q95 80 58 94"/>\n            <path d="M284.3 96.2 Q325 80 362 94"/>\n        </g>\n        <g fill="none" stroke="currentColor" stroke-width="2">\n            <circle cx="51" cy="94" r="5.5"/>\n            <circle cx="369" cy="94" r="5.5"/>\n        </g>\n        <g fill="currentColor" font-family="Georgia, serif" font-style="italic" font-size="18" text-anchor="middle">\n            <text x="51" y="74">A</text>\n            <text x="369" y="74">B</text>\n        </g>\n    </svg>',
      options: [
        'a) \\( 1\\ \\Omega \\)',
        'b) \\( 2\\ \\Omega \\)',
        'c) \\( 4\\ \\Omega \\)',
        'd) \\( 10\\ \\Omega \\)',
        'e) \\( 0{,}75\\ \\Omega \\)',
        'f) \\( 6\\ \\Omega \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Plan înclinat cu frecare.</b> Un corp este lansat cu viteza inițială \\( v_0 = 35 \\) m/s pe un plan înclinat care formează cu orizontala un unghi \\( \\alpha = 30^{\\circ} \\). Știind că raportul dintre timpul de coborâre și cel de urcare este \\( \\sqrt{7} \\), să se calculeze viteza finală a corpului cu care trece prin punctul de lansare.\n    <svg class="fig-svg" viewBox="0 0 440 250" role="img" aria-label="Corp lansat in sus pe un plan inclinat cu unghiul alfa fata de orizontala">\n        <path d="M60 215 L380 215 L380 30 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>\n        <path d="M108 215 A48 48 0 0 0 101.6 191" fill="none" stroke="currentColor" stroke-width="1.6"/>\n        <text x="122" y="208" fill="currentColor" font-family="Georgia, serif" font-style="italic" font-size="16">&#945;</text>\n        <g transform="translate(60,215) rotate(-30)">\n            <rect x="150" y="-40" width="54" height="40" fill="#7BA0D9" fill-opacity="0.22" stroke="currentColor" stroke-width="2"/>\n            <g stroke="#fbbf24" fill="#fbbf24">\n                <path d="M214 -20 H276" stroke-width="2.4" stroke-linecap="round"/>\n                <polygon points="292,-20 274,-26.5 274,-13.5"/>\n            </g>\n            <text x="252" y="-33" fill="#fbbf24" font-family="Georgia, serif" font-style="italic" font-size="18" text-anchor="middle">v<tspan font-size="12" font-style="normal" dy="4">0</tspan></text>\n        </g>\n    </svg>',
      options: [
        'a) \\( 5\\sqrt{3} \\) m/s',
        'b) \\( 35 \\) m/s',
        'c) \\( 5\\sqrt{7} \\) m/s',
        'd) \\( 12{,}24 \\) m/s',
        'e) \\( 17{,}5 \\) m/s',
        'f) \\( 7\\sqrt{7} \\) m/s',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Gaz într-un cilindru cu piston cuplat cu arc.</b> Într-un cilindru cu piston se găsește un volum de gaz \\( V_0 = 2 \\) L la \\( p_0 = 10^5 \\) Pa și \\( t_0 = 27\\,^{\\circ}\\mathrm{C} \\). Pistonul, de arie \\( S = 1 \\) dm\\( ^2 \\), se sprijină pe un arc cu constanta elastică \\( k = 1000 \\) N/m. Se încălzește gazul cu \\( \\Delta t = 50 \\) K. Să se calculeze comprimarea \\( \\Delta l \\) a arcului în urma încălzirii. Se consideră \\( \\sqrt{5664} \\approx 75{,}25 \\).\n    <svg class="fig-svg" viewBox="0 0 490 215" role="img" aria-label="Gaz intr-un cilindru cu piston, cuplat printr-o tija la un arc elastic fixat de perete">\n        <defs>\n            <pattern id="fiz-hatch-a" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">\n                <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" stroke-width="1.3" opacity="0.6"/>\n            </pattern>\n            <pattern id="fiz-hatch-b" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">\n                <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" stroke-width="1.3" opacity="0.6"/>\n            </pattern>\n        </defs>\n        <g fill="url(#fiz-hatch-a)" stroke="none">\n            <rect x="40" y="10.5" width="231" height="17.5"/>\n            <rect x="40" y="182" width="231" height="17.5"/>\n            <rect x="22.5" y="10.5" width="17.5" height="189"/>\n            <rect x="453" y="10.5" width="17.5" height="189"/>\n        </g>\n        <rect x="222" y="28" width="24.5" height="154" fill="url(#fiz-hatch-b)" stroke="currentColor" stroke-width="2"/>\n        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n            <path d="M40 28 H271 M40 182 H271 M40 28 V182"/>\n            <path d="M453 10.5 V199.5"/>\n            <path d="M246.5 105 H306"/>\n            <path d="M306 105 H316 L322 91 L334 119 L346 91 L358 119 L370 91 L382 119 L394 91 L406 119 L418 91 L430 119 L436 105 L453 105" stroke-linejoin="round"/>\n        </g>\n        <g fill="currentColor" font-family="Georgia, serif" font-style="italic" font-size="17" text-anchor="middle">\n            <text x="120" y="72">T<tspan font-size="12" font-style="normal" dy="4">0</tspan></text>\n            <text x="120" y="111">p<tspan font-size="12" font-style="normal" dy="4">0</tspan></text>\n            <text x="120" y="150">V<tspan font-size="12" font-style="normal" dy="4">0</tspan></text>\n            <text x="379" y="146">k</text>\n        </g>\n    </svg>',
      options: [
        'a) \\( 10 \\) cm',
        'b) \\( 0{,}2 \\) cm',
        'c) \\( 0{,}2 \\) m',
        'd) \\( 0{,}27 \\) m',
        'e) \\( 2{,}7 \\) cm',
        'f) \\( 0{,}27 \\) cm',
      ],
      correct: 'e',
    },
    {
      statement:
        '<b>Curent maxim printr-un rezistor.</b> În circuitul de mai jos se consideră \\( R_1 = 9\\ \\Omega \\), \\( R_4 = 4\\ \\Omega \\) și \\( E = 120 \\) V. Să se calculeze valorile rezistențelor \\( R_2 = R_3 \\) astfel încât intensitatea curentului prin \\( R_1 \\) să fie maximă.\n    <svg class="fig-svg" viewBox="0 0 520 305" role="img" aria-label="Circuit cu R3 in serie, R1 in paralel cu R2, apoi R4 si sursa E">\n        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">\n            <path d="M60 85 H90 M160 85 H200"/>\n            <rect x="90" y="71" width="70" height="28"/>\n            <path d="M200 85 V45 H230 M300 45 H330 V85"/>\n            <rect x="230" y="31" width="70" height="28"/>\n            <path d="M200 85 V125 H230 M300 125 H330 V85"/>\n            <rect x="230" y="111" width="70" height="28"/>\n            <path d="M330 85 H360 M430 85 H470"/>\n            <rect x="360" y="71" width="70" height="28"/>\n            <path d="M60 85 V255 H248"/>\n            <path d="M470 85 V255 H278"/>\n            <path d="M248 237 V273 M258 245 V265 M268 237 V273 M278 245 V265"/>\n        </g>\n        <g fill="currentColor">\n            <circle cx="200" cy="85" r="3.5"/>\n            <circle cx="330" cy="85" r="3.5"/>\n        </g>\n        <g fill="currentColor" font-family="Georgia, serif" font-style="italic" font-size="18" text-anchor="middle">\n            <text x="125" y="61">R<tspan font-size="13" font-style="normal" dy="4">3</tspan></text>\n            <text x="265" y="21">R<tspan font-size="13" font-style="normal" dy="4">1</tspan></text>\n            <text x="265" y="159">R<tspan font-size="13" font-style="normal" dy="4">2</tspan></text>\n            <text x="395" y="61">R<tspan font-size="13" font-style="normal" dy="4">4</tspan></text>\n            <text x="263" y="296">E</text>\n        </g>\n    </svg>',
      options: [
        'a) \\( 2\\ \\Omega \\)',
        'b) \\( 1\\ \\Omega \\)',
        'c) \\( 13\\ \\Omega \\)',
        'd) \\( 7\\ \\Omega \\)',
        'e) \\( 3\\ \\Omega \\)',
        'f) \\( 6\\ \\Omega \\)',
      ],
      correct: 'f',
    },
  ],
} as const;

const mate = {
  ...MATE,
  problems: [
    {
      statement:
        '<b>Progresii geometrice.</b> Determinați \\( x \\in \\mathbb{R} \\) astfel încât numerele \\( x+1 \\), \\( x+3 \\), \\( x+7 \\) să fie termeni consecutivi ai unei progresii geometrice.',
      options: [
        'a) \\( 0 \\)',
        'b) \\( 1 \\)',
        'c) \\( 2 \\)',
        'd) \\( -1 \\)',
        'e) \\( 3 \\)',
        'f) nu există',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Determinant circulant.</b> Fie \\( x_1, x_2, x_3 \\) rădăcinile polinomului \\( f = X^3 - 2X^2 + X - 3 \\). Calculați:\n    \\[ \\Delta = \\begin{vmatrix} x_1 & x_2 & x_3 \\\\ x_2 & x_3 & x_1 \\\\ x_3 & x_1 & x_2 \\end{vmatrix} \\]',
      options: [
        'a) \\( 2 \\)',
        'b) \\( 0 \\)',
        'c) \\( -2 \\)',
        'd) \\( 3 \\)',
        'e) \\( -1 \\)',
        'f) \\( 1 \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Numere complexe — modul și conjugat.</b> Fie \\( z \\in \\mathbb{C} \\) cu \\( |z| = 2 \\). Calculați:\n    \\[ |z + \\bar{z}|^2 + |z - \\bar{z}|^2 \\]',
      options: [
        'a) \\( 4 \\)',
        'b) \\( 8 \\)',
        'c) \\( 16 \\)',
        'd) \\( 2 \\)',
        'e) \\( 32 \\)',
        'f) \\( 12 \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Integrală pe interval simetric.</b> Calculați:\n    \\[ I = \\int_{-1}^{1} \\frac{x^{2025} + \\sin(x^3) + 1}{x^2 + 1} \\, dx \\]',
      options: [
        'a) \\( 0 \\)',
        'b) \\( \\pi \\)',
        'c) \\( \\dfrac{\\pi}{2} \\)',
        'd) \\( \\dfrac{\\pi}{4} \\)',
        'e) \\( 1 \\)',
        'f) \\( 2025 \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Sistem liniar cu parametru.</b> Determinați valorile parametrului \\( m \\in \\mathbb{R} \\) pentru care sistemul de mai jos este compatibil nedeterminat:\n    \\[ \\begin{cases} x + y + z = 1 \\\\ x + 2y + 3z = 2 \\\\ x + 3y + mz = 3 \\end{cases} \\]',
      options: [
        'a) \\( m = 5 \\)',
        'b) \\( m = 3 \\)',
        'c) \\( m \\neq 5 \\)',
        'd) \\( m = 0 \\)',
        'e) orice \\( m \\)',
        'f) niciun \\( m \\)',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Studiul funcțiilor — valoare maximă.</b> Fie funcția \\( f : (0, \\infty) \\to \\mathbb{R} \\), \\( f(x) = \\dfrac{\\ln x}{x} \\). Valoarea maximă a funcției este:',
      options: [
        'a) \\( e \\)',
        'b) \\( 1 \\)',
        'c) \\( \\dfrac{1}{e} \\)',
        'd) \\( 0 \\)',
        'e) \\( \\dfrac{1}{e^2} \\)',
        'f) \\( \\dfrac{2}{e} \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Tangenta dusă dintr-un punct exterior.</b> Tangenta la graficul funcției \\( f(x) = e^x \\) care trece prin originea \\( O(0,0) \\) are panta:',
      options: [
        'a) \\( 1 \\)',
        'b) \\( e \\)',
        'c) \\( \\dfrac{1}{e} \\)',
        'd) \\( e^2 \\)',
        'e) \\( 0 \\)',
        'f) \\( 2e \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Manipulare algebrică — sumă de pătrate.</b> Rezolvați, pentru \\( x \\ge 1, y \\ge 2, z \\ge 3 \\):\n    \\[ \\sqrt{x-1} + \\sqrt{y-2} + \\sqrt{z-3} = \\frac{x+y+z-3}{2} \\]\n    Calculați \\( x+y+z \\).',
      options: [
        'a) \\( 6 \\)',
        'b) \\( 9 \\)',
        'c) \\( 14 \\)',
        'd) \\( 12 \\)',
        'e) \\( 0 \\)',
        'f) o infinitate',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Ecuație trigonometrică — numărare grafică.</b> Numărul soluțiilor reale ale ecuației:\n    \\[ \\sin x = \\frac{x}{100} \\]',
      options: [
        'a) \\( 63 \\)',
        'b) \\( 62 \\)',
        'c) \\( 31 \\)',
        'd) \\( 64 \\)',
        'e) \\( 100 \\)',
        'f) o infinitate',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Limită — forma \\( 1^\\infty \\).</b> Calculați:\n    \\[ \\lim_{n \\to \\infty} \\left( \\frac{n^2+3n+1}{n^2+n+2} \\right)^n \\]',
      options: [
        'a) \\( 1 \\)',
        'b) \\( e \\)',
        'c) \\( e^2 \\)',
        'd) \\( e^{-2} \\)',
        'e) \\( \\infty \\)',
        'f) \\( e^4 \\)',
      ],
      correct: 'c',
    },
  ],
} as const;

export default defineSimulation({
  id: 'simulare-2026-07-21',
  startsAt: '2026-07-21T17:00:00+03:00',
  startsAtLabel: '21 Iulie 2026, ora 17:00',
  access: {
    kind: 'paid',
    simulationId: 'simulare-21-07',
    label: 'Simularea #4',
    buyUrl: 'https://admiterepoli.gumroad.com/l/simulare-21-07',
  },
  trackSelection: true,
  tracks: [
    {
      id: 'info',
      sections: [info, mate],
      resultId: 'simulare-2026-07-21-info',
      resultTitle: 'Simulare #4 — Mate + Informatica (Iulie 2026)',
    },
    {
      id: 'fizica',
      sections: [fizica, mate],
      resultId: 'simulare-2026-07-21-fizica',
      resultTitle: 'Simulare #4 — Mate + Fizica (Iulie 2026)',
    },
  ],
  ...LEGACY_RULES,
  timer: LEGACY_DEADLINE_TIMER,
  resultsEndpoint:
    'https://script.google.com/macros/s/AKfycbwGeM5O5MzcflRFG48ilo9YLWYJ6UF8VAm10bPnkHrE3Ujq9eI7krJDSm-AT5_1LyArsA/exec',
});
