/**
 * Simulare #3 — Mate + … (9 Mai 2026): data of the legacy page simulare-2026-05-09.html (its `allProblems.info`,
 * `allProblems.fizica` and `problemsMate` arrays, extracted verbatim). Paid simulation behind the
 * exam gate, with the choice between Mate + Informatică and Mate + Fizică.
 */
import { defineSimulation, FIZICA, INFO, LEGACY_COUNTDOWN_TIMER, LEGACY_RULES, MATE } from './_schema';

const info = {
  ...INFO,
  problems: [
    {
      statement:
        '<b>Grafuri Orientate.</b> Se consideră un graf orientat cu 10 noduri, numerotate de la 1 la 10. Există un arc de la nodul \\(i\\) la nodul \\(j\\) dacă și numai dacă \\(i &lt; j\\) și diferența \\((j - i)\\) este un număr impar. Câte drumuri elementare distincte există de la nodul 1 la nodul 10?',
      options: ['a) 34', 'b) 55', 'c) 21', 'd) 89', 'e) 13', 'f) 10'],
      correct: 'a',
    },
    {
      statement:
        '<b>Parcurgerea Matricei.</b> Considerați următoarea funcție C++ pentru parcurgerea zig-zag a unei matrice cu <code>n</code> linii și <code>m</code> coloane. Completați <code>___(1)___</code> și <code>___(2)___</code>:\n    <pre><code class="cpp">void iter_mat(int mat[100][100],\n              int n, int m) {\n    for (int j = 0; j &lt; m; j++) {\n        if (___(1)___) {\n            for (int i = 0; i &lt; n; i++)\n                cout &lt;&lt; mat[i][j] &lt;&lt; " ";\n        } else {\n            for (___(2)___) {\n                cout &lt;&lt; mat[i][j] &lt;&lt; " ";\n            }\n        }\n    }\n}</code></pre>',
      options: [
        'a) <code>(1) j%2==0</code> ; <code>(2) int i=n-1; i>=0; i--</code>',
        'b) <code>(1) j%2!=0</code> ; <code>(2) int i=n-1; i>=0; i--</code>',
        'c) <code>(1) j%2==0</code> ; <code>(2) int i=n; i>0; i--</code>',
        'd) <code>(1) i%2==0</code> ; <code>(2) int i=n-1; i>=0; i--</code>',
        'e) <code>(1) j%2!=0</code> ; <code>(2) int i=n; i>=0; i--</code>',
        'f) <code>(1) j%2==0</code> ; <code>(2) int i=0; i&lt;n; i++</code>',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Arbore Binar Complet cu Valori Fibonacci.</b> Nodurile unui arbore binar complet sunt numerotate \\(1, 2, 3, \\ldots\\) prin BFS. În nodul \\(i\\) se stochează \\(F_i\\) (\\(F_1=F_2=1\\)). Care este suma valorilor de pe nivelul \\(k\\) \\((k \\ge 1)\\)?',
      options: [
        'a) \\( F_{2^{k+1}} - F_{2^k} \\)',
        'b) \\( F_{2^{k+1}+1} - F_{2^k+1} \\)',
        'c) \\( F_{2^{k+1}-1} - F_{2^k-1} \\)',
        'd) \\( F_{2^{k+1}+2} - F_{2^k+2} \\)',
        'e) \\( F_{2^{k+1}} + F_{2^k} \\)',
        'f) \\( F_{2^{k-1}} \\cdot F_{2^k} \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Complexitate cu Matrice de Adiacență.</b> Fie matricea de adiacență a unui arbore cu \\(V\\) noduri. Care este complexitatea de timp pentru a afla numărul de muchii și, respectiv, a identifica toate nodurile frunză?',
      options: [
        'a) Muchii: \\(\\mathcal{O}(1)\\), Frunze: \\(\\mathcal{O}(V^2)\\)',
        'b) Muchii: \\(\\mathcal{O}(V^2)\\), Frunze: \\(\\mathcal{O}(V^2)\\)',
        'c) Muchii: \\(\\mathcal{O}(V)\\), Frunze: \\(\\mathcal{O}(V)\\)',
        'd) Muchii: \\(\\mathcal{O}(1)\\), Frunze: \\(\\mathcal{O}(V)\\)',
        'e) Muchii: \\(\\mathcal{O}(V^2)\\), Frunze: \\(\\mathcal{O}(1)\\)',
        'f) Muchii: \\(\\mathcal{O}(\\log V)\\), Frunze: \\(\\mathcal{O}(V \\log V)\\)',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Șiruri de Caractere.</b> Ce va afișa următorul program C++?\n    <pre><code class="cpp">#include &lt;iostream&gt;\n#include &lt;cstring&gt;\nusing namespace std;\nint main() {\n    char s1[] = "EduCatiOnal";\n    char s2[] = "PrOgrAming";\n    char rez[30] = "";\n    int i = 0, j = 0, k = 0;\n    while (s1[i]) {\n        while (s1[i] &&\n               !strchr("aeiouAEIOU", s1[i]))\n            i++;\n        if (s1[i]) {\n            rez[k++] = s1[i++];\n            while (s2[j] &&\n                   !strchr("aeiouAEIOU", s2[j]))\n                j++;\n            if (s2[j]) rez[k++] = s2[j++];\n        }\n    }\n    cout &lt;&lt; rez;\n    return 0;\n}</code></pre>',
      options: [
        'a) <code>EOuAai</code>',
        'b) <code>EuaOaiOAa</code>',
        'c) <code>EOuAaiiOa</code>',
        'd) <code>OEAuiaaOi</code>',
        'e) <code>EduPrO</code>',
        'f) Eroare de compilare',
      ],
      correct: 'c',
    },
    {
      statement:
        '<b>Divide et Impera cu modificare In-Place.</b> Ce va afișa la rulare?\n    <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\nint f(int a[], int st, int dr) {\n    if (st == dr) return a[st];\n    int m = (st + dr) / 2;\n    int x = f(a, st, m);\n    int y = f(a, m + 1, dr);\n    if (x > y) { a[m] = y; return x; }\n    else { a[m + 1] = x; return y; }\n}\nint main() {\n    int v[] = {8, 2, 5, 3, 7, 9};\n    cout &lt;&lt; f(v, 0, 5) &lt;&lt; "\n";\n    for (int i = 0; i &lt; 6; i++)\n        cout &lt;&lt; v[i] &lt;&lt; " ";\n    return 0;\n}</code></pre>',
      options: [
        'a) <code>9</code> / <code>2 5 5 8 3 7</code>',
        'b) <code>9</code> / <code>5 2 5 8 7 3</code>',
        'c) <code>8</code> / <code>2 5 8 5 3 7</code>',
        'd) <code>9</code> / <code>2 2 5 8 3 7</code>',
        'e) <code>9</code> / <code>8 5 5 2 3 7</code>',
        'f) Comportament nedefinit',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Generare Lexicografică.</b> Un algoritm backtracking generează toate anagramele cuvântului <em>info</em> în ordine alfabetică. Primele patru: <em>fino</em>, <em>fion</em>, <em>fnio</em>, <em>fnoi</em>. Care este a opta soluție?',
      options: [
        'a) <code>foin</code>',
        'b) <code>ifon</code>',
        'c) <code>ifno</code>',
        'd) <code>foni</code>',
        'e) <code>nifo</code>',
        'f) <code>inof</code>',
      ],
      correct: 'b',
    },
    {
      statement:
        '<b>Structuri și Transmiterea Parametrilor.</b> Ce va afișa la rulare?\n    <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\nstruct Punct { int x, y; };\nvoid transforma(Punct &A,\n                Punct B) {\n    A.x = A.x + B.x;\n    B.y = A.y + B.y;\n    A.y = B.y - A.x;\n}\nint main() {\n    Punct p1 = {3, 5};\n    Punct p2 = {2, 4};\n    transforma(p1, p2);\n    cout &lt;&lt; p1.x &lt;&lt; " " &lt;&lt; p1.y\n         &lt;&lt; " " &lt;&lt; p2.x &lt;&lt; " " &lt;&lt; p2.y;\n    return 0;\n}</code></pre>',
      options: [
        'a) <code>5 4 2 4</code>',
        'b) <code>5 4 5 9</code>',
        'c) <code>5 9 2 4</code>',
        'd) <code>5 -1 2 4</code>',
        'e) <code>5 4 2 9</code>',
        'f) Comportament nedefinit',
      ],
      correct: 'a',
    },
    {
      statement:
        '<b>Geometrie analitică și logică.</b> Fie un triunghi cu vârfurile \\(A(x_A, y_A)\\), \\(B(x_B, y_B)\\) și \\(C(x_C, y_C)\\). Care dintre următoarele expresii verifică riguros proprietatea că \\(\\Delta ABC\\) este un triunghi echilateral cu centrul de greutate în originea sistemului cartezian \\((0,0)\\)?\n            <pre style="background:rgba(0,0,0,0.3);padding:0.8em 1em;border-radius:6px;font-family:monospace;font-size:0.93em;line-height:1.7;margin-top:0.6em;white-space:pre-wrap;">I1. xA + xB + xC == 0 &amp;&amp; yA + yB + yC == 0&#10;I2. xA*xA + yA*yA == xB*xB + yB*yB &amp;&amp; xB*xB + yB*yB == xC*xC + yC*yC&#10;I3. xA + yA == 0 &amp;&amp; xB + yB == 0 &amp;&amp; xC + yC == 0&#10;I4. xA&sup2; + xB&sup2; + xC&sup2; == 0 &amp;&amp; yA&sup2; + yB&sup2; + yC&sup2; == 0&#10;I5. xA * xB * xC == yA * yB * yC</pre>',
      options: ['a) I1', 'b) I2', 'c) I1 și I2', 'd) I4 și I5', 'e) I1, I2 și I4', 'f) I2 și I4'],
      correct: 'c',
    },
    {
      statement:
        '<b>Pointeri.</b> Ce va afișa următorul program C++ la execuție?\n            <pre><code class="cpp">#include &lt;iostream&gt;\nusing namespace std;\nfloat f(float* a, float* b, float* C) {\n    *a = *a + *b;\n    *b = *a - C[0];\n    C++;\n    a = C;\n    b = C + 1;\n    *a = *a * 2.0;\n    *b = *a + 1.0;\n    return *a + *b;\n}\nint main() {\n    float a = 3.5;\n    float b = 2.0;\n    float C[3] = {1.0, 2.0, 3.0};\n    float result = f(&amp;a, &amp;b, C);\n    cout &lt;&lt; a + result + b + C[0] &lt;&lt; "\n";\n    return 0;\n}</code></pre>',
      options: [
        'a) <code>15.5</code>',
        'b) <code>18</code>',
        'c) <code>20</code>',
        'd) <code>23</code>',
        'e) <code>11.5</code>',
        'f) Eroare de compilare',
      ],
      correct: 'c',
    },
  ],
} as const;

const fizica = {
  ...FIZICA,
  problems: [
    {
      statement: 'Accelerația de \\( 12960 \\text{ km/h}^2 \\) exprimată în \\( \\text{m/s}^2 \\) este:',
      options: [
        'a) \\( 1 \\text{ m/s} \\)',
        'b) \\( 1{,}5 \\text{ ms} \\)',
        'c) \\( 1{,}2 \\text{ m/s}^2 \\)',
        'd) \\( 1 \\text{ ms}^2 \\)',
        'e) \\( 1 \\text{ m/s}^2 \\)',
        'f) \\( 1{,}5 \\text{ m/s}^2 \\)',
      ],
      correct: 'e',
    },
    {
      statement:
        'Un vas de volum \\( 2{,}55 \\text{ l} \\) conține \\( 15 \\text{ mg} \\) de hidrogen la \\( 2700^\\circ\\text{C} \\). Gradul de disociere \\( \\alpha = 0{,}25 \\). Calculați presiunea gazului.',
      options: [
        'a) \\( 90{,}8 \\cdot 10^3 \\text{ Pa} \\)',
        'b) \\( 90{,}8 \\cdot 10^5 \\text{ Pa} \\)',
        'c) \\( 90{,}8 \\cdot 10^3 \\text{ Pa} \\)',
        'd) \\( 10^5 \\text{ Pa} \\)',
        'e) \\( 72663 \\text{ Pa} \\)',
        'f) nu se poate determina',
      ],
      correct: 'a',
    },
    {
      statement:
        'Două vapoare A și B pornesc la aceeași oră cu viteze constante. Se întâlnesc la ora 14:00. A ajunge la destinația lui B la ora 18:00, B ajunge la destinația lui A la ora 23:00. La ce oră au pornit?',
      options: ['a) 8:30', 'b) 6:00', 'c) 8:00', 'd) 7:00', 'e) 11:00', 'f) 10:00'],
      correct: 'c',
    },
    {
      statement:
        'Ce forță orizontală \\( F \\) trebuie aplicată constant asupra lui \\( M = 100 \\text{ kg} \\) astfel încât \\( M_1 = 45 \\text{ kg} \\) și \\( M_2 = 17 \\text{ kg} \\) să rămână în repaus față de \\( M \\)? (\\( M_1 \\) pe roți pe \\( M \\), \\( M_2 \\) atârnă vertical; \\( g = 10 \\text{ m/s}^2 \\))',
      options: ['a) 170 N', 'b) 612 N', 'c) 450 N', 'd) 1000 N', 'e) 1620 N', 'f) 180 N'],
      correct: 'b',
    },
    {
      statement:
        'Doi cilindri orizontali cu \\( S_1 = 3{\\cdot}10^{-2} \\text{ m}^2 \\), \\( S_2 = 10^{-2} \\text{ m}^2 \\), pistoane cuplate rigid. Inițial \\( V_1 = 6{\\cdot}10^{-3} \\text{ m}^3 \\), \\( V_2 = 2{\\cdot}10^{-3} \\text{ m}^3 \\), \\( p_0 = 10^5 \\text{ Pa} \\), \\( T = 300 \\text{ K} \\). Cilindrul 1 încălzit la \\( T_1 = 500 \\text{ K} \\). Calculați deplasarea \\( x \\) a pistoanelor.',
      options: ['a) 100 mm', 'b) 0,75 m', 'c) 1 cm', 'd) 7,5 cm', 'e) 0,075 cm', 'f) 0,1 m'],
      correct: 'd',
    },
    {
      statement:
        'Un acumulator alimentează un bec printr-o linie cu \\( R_L = 5\\,\\Omega \\). Puterea becului = 50% din puterea totală. \\( U_b = 15 \\text{ V} \\), \\( P_{ext} = 50 \\text{ W} \\). Care este intensitatea de scurtcircuit?',
      options: ['a) 12 A', 'b) 16 A', 'c) 8 A', 'd) 12 V', 'e) nu se poate calcula', 'f) 11 A'],
      correct: 'a',
    },
    {
      statement:
        'Coeficientul de temperatură al unui rezistor cu \\( R_2 = nR_1 \\) (\\( R_1 \\) la \\( t_1 \\), \\( R_2 \\) la \\( t_2 \\)) are expresia:',
      options: [
        'a) \\( \\alpha = \\dfrac{n-1}{t_1} \\)',
        'b) \\( \\alpha = \\dfrac{n-1}{t_2 - t_1} \\)',
        'c) \\( \\alpha = \\dfrac{n-1}{t_2} \\)',
        'd) \\( \\alpha = \\dfrac{n-1}{t_2 - t_1} \\)',
        'e) \\( \\alpha = \\dfrac{n}{t_1 - 1} \\)',
        'f) nicio variantă corectă',
      ],
      correct: 'f',
    },
    {
      statement:
        'Calculați rezistența echivalentă a unui circuit în scară infinit cu \\( R_1 = 2\\,\\Omega \\) (orizontal) și \\( R_2 = 1\\,\\Omega \\) (vertical).',
      options: [
        'a) \\( \\infty \\)',
        'b) \\( 1 + \\sqrt{3}\\,\\Omega \\)',
        'c) \\( 1 - \\sqrt{3}\\,\\Omega \\)',
        'd) \\( 1 + 2\\sqrt{3}\\,\\Omega \\)',
        'e) \\( 2 + \\sqrt{3}\\,\\Omega \\)',
        'f) \\( 0 \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        'O mașină termică cu \\( \\eta = 0{,}3 \\) cedează \\( Q_c = 210 \\text{ J} \\) per ciclu. Puterea utilă la \\( n = 10 \\) cicluri/secundă este:',
      options: ['a) 900 W', 'b) 1000 W', 'c) 450 W', 'd) 600 W', 'e) 300 W', 'f) 630 W'],
      correct: 'a',
    },
    {
      statement:
        'Un punct material \\( m = 1 \\text{ kg} \\) alunecă fără frecare pe o suprafață curbă de rază \\( R = 5 \\text{ m} \\), pornind din repaus. Viteza la sol este (\\( g = 10 \\text{ m/s}^2 \\)):',
      options: [
        'a) 8 m/s',
        'b) 10 m/s',
        'c) 4 m/s',
        'd) \\( 8 \\text{ m/s}^2 \\)',
        'e) 20 m/s',
        'f) \\( 10 \\text{ m/s}^2 \\)',
      ],
      correct: 'b',
    },
  ],
} as const;

const mate = {
  ...MATE,
  problems: [
    {
      statement:
        'Fie \\( f(x) = \\{x\\}(1-\\{x\\}) \\), unde \\( \\{x\\} \\) este partea fracționară. Calculați: \\[ \\int_{0}^{10} f(x) \\, dx \\]',
      options: [
        'a) \\( \\dfrac{1}{6} \\)',
        'b) \\( \\dfrac{10}{3} \\)',
        'c) \\( \\dfrac{5}{3} \\)',
        'd) \\( 0 \\)',
        'e) \\( 5 \\)',
        'f) \\( 1 \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        'Fie \\( (x,y,z) \\) o soluție reală a sistemului: \\[ \\begin{cases} x + y + z = 2 \\\\ x^2 + y^2 + z^2 = 6 \\\\ x^3 + y^3 + z^3 = 8 \\end{cases} \\] Calculați valoarea expresiei \\( E = x^4 + y^4 + z^4 \\).',
      options: [
        'a) \\( 12 \\)',
        'b) \\( 16 \\)',
        'c) \\( 20 \\)',
        'd) \\( 18 \\)',
        'e) \\( 24 \\)',
        'f) \\( 14 \\)',
      ],
      correct: 'd',
    },
    {
      statement:
        "Fie \\( f(x) = \\text{arctg}(x) + \\text{arctg}\\!\\left(\\dfrac{1-x}{1+x}\\right) \\). Calculați \\( f'(2026) \\).",
      options: [
        'a) \\( 1 \\)',
        'b) \\( 0 \\)',
        'c) \\( \\dfrac{1}{2026} \\)',
        'd) \\( \\dfrac{\\pi}{4} \\)',
        'e) \\( -1 \\)',
        'f) \\( \\dfrac{1}{1+2026^2} \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        'Determinați \\( a, b, c \\in \\mathbb{R} \\) astfel încât \\( f(x) = ax^3 + bx^2 + c \\) să fie simetrică față de \\( M(1,2) \\).',
      options: [
        'a) \\( a=1,\\ b=-3,\\ c=4 \\)',
        'b) \\( a \\in \\mathbb{R}^*,\\ b=-3a,\\ c=2+2a \\)',
        'c) \\( a \\in \\mathbb{R}^*,\\ b=-3a,\\ c=2-2a \\)',
        'd) \\( a=2,\\ b=-6,\\ c=6 \\)',
        'e) \\( a=1,\\ b=3,\\ c=-2 \\)',
        'f) \\( a=1,\\ b=-3,\\ c=2 \\)',
      ],
      correct: 'b',
    },
    {
      statement:
        'Aflați numărul punctelor de extrem local ale funcției: \\[ f(x) = |x^2 - 4x + 3| \\cdot e^{-x} \\]',
      options: [
        'a) \\( 2 \\)',
        'b) \\( 3 \\)',
        'c) \\( 5 \\)',
        'd) \\( 1 \\)',
        'e) \\( 0 \\)',
        'f) \\( 4 \\)',
      ],
      correct: 'f',
    },
    {
      statement: 'Rezolvați: \\[ \\cos(2x) + 3\\sin(x) - 2 = 0, \\quad x \\in [0, 2\\pi] \\]',
      options: [
        'a) \\( \\emptyset \\)',
        'b) \\( \\left\\{\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}\\right\\} \\)',
        'c) \\( \\left\\{\\frac{\\pi}{6},\\ \\frac{\\pi}{2},\\ \\frac{5\\pi}{6}\\right\\} \\)',
        'd) \\( \\{0,\\pi,2\\pi\\} \\)',
        'e) \\( \\left\\{\\frac{\\pi}{3},\\ \\frac{\\pi}{2},\\ \\frac{2\\pi}{3}\\right\\} \\)',
        'f) \\( \\{\\pi\\} \\)',
      ],
      correct: 'c',
    },
    {
      statement: 'Aflați formula pentru \\( S_n = \\displaystyle\\sum_{k=1}^{n} k \\cdot k! \\).',
      options: [
        'a) \\( n! \\)',
        'b) \\( (n+1)! \\)',
        'c) \\( n\\cdot n! \\)',
        'd) \\( (n-1)! \\)',
        'e) \\( (n+1)!-1 \\)',
        'f) \\( \\dfrac{n(n+1)}{2} \\)',
      ],
      correct: 'e',
    },
    {
      statement:
        'Fie \\( A = \\dfrac{1}{2}\\begin{pmatrix}2&3&2\\\\3&5&4\\\\4&7&8\\end{pmatrix} \\). Se știe că \\( ABA = A^{-1} \\). Calculați \\( \\det(B^T) \\).',
      options: [
        'a) \\( \\dfrac{1}{64} \\)',
        'b) \\( 8 \\)',
        'c) \\( \\dfrac{1}{8} \\)',
        'd) \\( 64 \\)',
        'e) \\( 1 \\)',
        'f) \\( -64 \\)',
      ],
      correct: 'd',
    },
    {
      statement:
        'Determinați suma pătratelor soluțiilor ecuației: \\[ \\frac{-z^3-1}{z+1} = z-1, \\quad z \\in \\mathbb{C} \\setminus \\{-1\\} \\]',
      options: [
        'a) \\( 1 \\)',
        'b) \\( -1 \\)',
        'c) \\( 0 \\)',
        'd) \\( 4 \\)',
        'e) \\( -2 \\)',
        'f) \\( \\frac{1}{2} \\)',
      ],
      correct: 'c',
    },
    {
      statement:
        'Fie \\( a,b\\in(0,\\infty) \\) și \\( f_k(x)=k^x \\). Calculați: \\[ L = \\lim_{x\\to 0}\\left(\\frac{f_a(x)+f_b(x)}{2}\\right)^{\\!\\frac{1}{x}} \\]',
      options: [
        'a) \\( ab \\)',
        'b) \\( 1 \\)',
        'c) \\( \\dfrac{a+b}{2} \\)',
        'd) \\( e^{ab} \\)',
        'e) \\( \\infty \\)',
        'f) \\( \\sqrt{ab} \\)',
      ],
      correct: 'f',
    },
  ],
} as const;

export default defineSimulation({
  id: 'simulare-2026-05-09',
  // Decided in #137: the start is 10:00 (moved on the day). Legacy had two disagreeing fallbacks
  // (10:10 in main.js, 9:50 in firebase-auth.js) and no value of its own.
  startsAt: '2026-05-09T10:00:00+03:00',
  startsAtLabel: '9 Mai 2026, ora 10:00',
  access: { kind: 'paid', simulationId: 'simulare_09_05' },
  trackSelection: true,
  tracks: [
    {
      id: 'info',
      sections: [info, mate],
      resultId: 'simulare-2026-05-09-info',
      resultTitle: 'Simulare #3 — Mate + Informatica (9 Mai 2026)',
    },
    {
      id: 'fizica',
      sections: [fizica, mate],
      resultId: 'simulare-2026-05-09-fizica',
      resultTitle: 'Simulare #3 — Mate + Fizica (9 Mai 2026)',
    },
  ],
  ...LEGACY_RULES,
  timer: LEGACY_COUNTDOWN_TIMER,
  resultsEndpoint:
    'https://script.google.com/macros/s/AKfycbxIsBEAPd_9IY57kBCVT1ISmvSfyJ28AZBuIVGnAhSzf7mQkCoEQ4lEDgIpQzKyILLN/exec',
});
