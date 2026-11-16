/**
 * Catalog of the exercitii-video page (legacy `exercitiiMate` / `exercitiiInfo` in the inline
 * module of exercitii-video.html). Titles and statements are copied character for character; the
 * YouTube ids are not here: they live in Firestore (`videos/<docId>`) and are fetched only for the
 * lessons the user may watch.
 */

/** Who may watch a lesson: any signed-in account, or Student Plus only. */
export type LessonAccess = 'account' | 'plus';

export interface Lesson {
  /** Number shown as `Lecția 01`. */
  id: number;
  /** Id of the Firestore document `videos/<docId>` that holds the YouTube id. */
  docId: string;
  title: string;
  access: LessonAccess;
  /** Text of the problem, shown in the video modal. */
  statement: string;
  /** Placeholder card, not clickable. */
  comingSoon?: true;
}

export const exercitiiMate: readonly Lesson[] = [
  {
    id: 1,
    docId: 'mate-1',
    title: 'Numere complexe',
    access: 'account',
    statement: 'Fie z ∈ ℂ cu z + 1/z = 1. Calculați valoarea expresiei E = z²⁰²⁶ + 1/z²⁰²⁶.',
  },
  {
    id: 2,
    docId: 'mate-2',
    title: 'Integrală cu modul',
    access: 'account',
    statement: 'Aflați t ∈ ℝ* pentru care ∫₀^(π/2) |sin x + t·cos x| dx = 1.',
  },
  {
    id: 3,
    docId: 'mate-3',
    title: 'Integrală cu schimbare de variabilă',
    access: 'plus',
    statement: 'Calculați integrala nedefinită ∫ (x²−1)/(x⁴+1) dx.',
  },
  {
    id: 4,
    docId: 'mate-4',
    title: 'Integrală cu sfârșit interesant',
    access: 'plus',
    statement: 'Calculați valoarea integralei I = ∫_(1/e)^e (1 − 1/x²)·e^(x+1/x) dx.',
  },
  {
    id: 5,
    docId: 'mate-5',
    title: 'Integrală cu 2 părți întregi',
    access: 'plus',
    statement: 'Calculați I = ∫_(1/4)^(1/2) ⌊ln⌊1/x⌋⌋ dx, unde ⌊·⌋ este funcția parte întreagă.',
  },
  {
    id: 6,
    docId: 'mate-6',
    title: 'Funcții interesante',
    access: 'plus',
    statement:
      'Fie f: ℝ→ℝ continuă cu f(x³+x) = x·eˣ/(3x²+1) + x² pentru orice x ∈ ℝ. Calculați ∫₀² f(t) dt.',
  },
  {
    id: 7,
    docId: 'mate-7',
    title: 'Funcție derivabilă — integrală',
    access: 'plus',
    statement:
      'Fie f: (0,∞)→(0,∞) derivabilă cu ∫₁ˣ f(t) dt = x²f(x) − 1 pentru orice x ∈ ℝ₊*. Determinați f(x).',
  },
  {
    id: 8,
    docId: 'mate-8',
    title: 'Număr de soluții și Lagrange',
    access: 'account',
    statement: 'Să se determine numărul de soluții reale ale ecuației: 2ˣ + 3ˣ = 4ˣ + 1.',
  },
  {
    id: 9,
    docId: 'mate-9',
    title: 'Limită cu sumă Riemann',
    access: 'plus',
    statement: 'Să se calculeze lim(n→∞) Σ(k=1..n) n/(n² + k²x²) pentru orice x > 0.',
  },
  {
    id: 10,
    docId: 'mate-10',
    title: 'Arie disc, lucram in complex',
    access: 'plus',
    statement:
      'Să se calculeze aria suprafeței, din planul complex determinată de următoarea ecuație: |z − 2 + 3i| ≤ 2',
  },
  {
    id: 11,
    docId: 'mate-11',
    title: 'Functia definita prin ecuatie, derivare ecuatie',
    access: 'plus',
    statement:
      "Se considera functia y = y(x), definita implicit de ecuatia x³ + y³ - 3xy = 1, y(0) = 1, aflati y''(0)",
  },
  {
    id: 12,
    docId: 'mate-12',
    title: 'Partea imaginara a unui numar complex ridicat la putere',
    access: 'plus',
    statement:
      'Fie numărul complex z ∈ C \\ {1} astfel încât |z| = 1. Se consideră numărul: ω = ((z + 1) / (z − 1))^2026. Să se determine partea imaginară a numărului complex ω (Im(ω)).',
  },
  {
    id: 13,
    docId: 'mate-13',
    title: 'Sumă cu combinări',
    access: 'plus',
    statement:
      'Să se determine expresia sumei Sₙ = Cₙ¹ · 1/2 + Cₙ² · 1/2² + ... + Cₙⁿ⁻¹ · 1/2ⁿ⁻¹, pentru n ∈ ℕ, n ≥ 2.',
  },
  {
    id: 14,
    docId: 'mate-14',
    title: 'Partea intreaga a unei integrale clasice',
    access: 'plus',
    statement: 'Să se determine partea întreagă a următoarei integrale: I = ∫₀¹ eˣ² dx.',
  },
  { id: 15, docId: 'mate-15', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 16, docId: 'mate-16', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 17, docId: 'mate-17', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 18, docId: 'mate-18', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
];

export const exercitiiInfo: readonly Lesson[] = [
  {
    id: 1,
    docId: 'info-1',
    title: 'Indexare vector',
    access: 'account',
    statement:
      'Ce elemente conține v după executarea: int v[]={1,2,3,4,5}; for(int i=0;i<5;i++) v[i]=v[v[i]%5];',
  },
  {
    id: 2,
    docId: 'info-2',
    title: 'Trepte dinamice',
    access: 'account',
    statement:
      'O piramidă cu 10 niveluri. Salt simplu (+1 nivel) sau salt dublu (+2 niveluri). Orice salt dublu trebuie urmat obligatoriu de cel puțin un salt simplu. Câte trasee distincte există de la nivelul 0 la 10?',
  },
  {
    id: 3,
    docId: 'info-3',
    title: 'Anagrame',
    access: 'plus',
    statement:
      'În câte moduri pot fi aranjate cele 8 litere din cuvântul TRIANGLE pe un rând, astfel încât să nu apară niciunul dintre șirurile GIA sau NT?',
  },
  {
    id: 4,
    docId: 'info-4',
    title: 'Numere cu proprietăți',
    access: 'plus',
    statement:
      'int f(int n){if(n==0)return 0; return (n%10)-f(n/10);} Câte numere naturale n de exact 3 cifre îndeplinesc condiția f(n)==0?',
  },
  {
    id: 5,
    docId: 'info-5',
    title: 'Recursivă pe cifre',
    access: 'plus',
    statement:
      'int f(int n,int &k){if(n==0)return 0; int t=f(n/10,k); k=k*10+n%10; return t+k;} int k=0; cout<<f(123,k); Ce valoare se afișează?',
  },
  {
    id: 6,
    docId: 'info-6',
    title: 'Dulapuri perfecte',
    access: 'plus',
    statement:
      '1000 de dulapuri inițial închise. Elevul i schimbă starea tuturor dulapurilor cu numărul multiplu de i (i=1..1000). Câte dulapuri rămân deschise la final?',
  },
  {
    id: 7,
    docId: 'info-7',
    title: 'Combinatorică — Stars & Bars',
    access: 'plus',
    statement:
      'Într-o parcare cu 10 locuri consecutive, trebuie parcate 3 mașini distincte astfel încât între oricare două mașini parcate să existe cel puțin 2 locuri libere. În câte moduri?',
  },
  {
    id: 8,
    docId: 'info-8',
    title: 'Numărare funcții strict crescătoare',
    access: 'account',
    statement:
      'Fie funcția f : A → B, unde A = {1, 2, 3} și B = {1, 2, 3, 4, 5}. Câte funcții strict crescătoare f cu proprietatea că f(2) ≠ 3 există?',
  },
  {
    id: 9,
    docId: 'info-9',
    title: 'Arbore binar colorat',
    access: 'plus',
    statement:
      'Arbore binar neordonat cu 9 noduri: baza este un arbore perfect cu 7 noduri, iar 2 noduri suplimentare sunt pe nivelul următor. Colorăm nodurile cu 3 culori astfel încât orice nod să aibă culoare diferită de părintele și fratele său (dacă există). În câte moduri distincte poate fi structurat și colorat arborele?',
  },
  {
    id: 10,
    docId: 'info-10',
    title: 'Vector special și parcurgere cu pas variabil',
    access: 'plus',
    statement:
      'Considerăm un vector V cu 2026 de elemente, indexat de la 0 la 2025 populat după anumite reguli, ce valoare va fi printată pe ecran la finalul execuției?',
  },
  {
    id: 11,
    docId: 'info-11',
    title: 'Optimizare rute in graf orientat',
    access: 'plus',
    statement:
      'Consideram o retea de transmisie a datelor reprezentata de o forma a unui graf orientat, aciclic format din 6 noduri. Datele pleaca exclusiv de la nodul 6 si trebuie sa ajunga la serverele finale A si B, optimizati ruta schimbat orientarea muchiilor',
  },
  {
    id: 12,
    docId: 'info-12',
    title: 'Complexitatea ordonarii elementelor dintr-o matrice',
    access: 'plus',
    statement:
      'Fie o matrice pătratică A cu N linii și N coloane. Ce complexitate are algoritmul optim pentru a ordona strict crescător elementele aflate sub diagonala principală, lăsând restul elementelor nemodificate?',
  },
  {
    id: 13,
    docId: 'info-13',
    title: 'Lampadare consecutive',
    access: 'plus',
    statement:
      'Pe o alee sunt aliniate 10 lampadare. În câte moduri distincte pot funcționa sau fi defecte, astfel încât să nu existe niciodată două lampadare defecte consecutive?',
  },
  {
    id: 14,
    docId: 'info-14',
    title: 'Numar de cicluri dintr-un graf complet',
    access: 'plus',
    statement:
      'Se consideră un graf neorientat complet cu $n = 6$ noduri. Câte cicluri elementare distincte de lungime 4 conține acest graf? (Două cicluri se consideră distincte dacă diferă prin cel puțin o muchie).',
  },
  { id: 15, docId: 'info-15', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 16, docId: 'info-16', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 17, docId: 'info-17', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
  { id: 18, docId: 'info-18', title: 'În curând', access: 'plus', statement: '', comingSoon: true },
];
