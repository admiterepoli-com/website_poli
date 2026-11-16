import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-simulare-admiterepoli-3',
  title: 'Rezolvare Simulare Matematică, Informatică și Fizică | AdmiterePoli 3',
  description:
    'Rezolvarea completă, pas cu pas, a subiectelor de matematică, informatică și fizică de la simularea AdmiterePoli #3.',
  h1: 'Rezolvare Simulare Matematică, Informatică și Fizică',
  intro:
    'Aici găsești rezolvarea detaliată, pas cu pas, pentru subiectele combinate de la proba de Matematică, Informatică și Fizică de la simularea #3. Parcurge explicațiile pentru a înțelege exact cum se abordează fiecare problemă.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile pentru această simulare:',
  usefulLinks: [
    {
      href: './simulare-2026-05-09',
      label: 'Rezolvă Subiectul',
    },
    {
      href: './barem-simulare-admiterepoli-3',
      label: 'Vezi baremul de corectare',
    },
  ],
  pdf: 'pdfs/rezolvare-simulare-admiterepoli-3.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvării.',
  relatedHeading: 'Mai exersează:',
  related: [
    {
      href: './rezolvare-simulare-admiterepoli-2',
      label: 'Rezolvare Simulare AdmiterePoli #2',
    },
    {
      href: './rezolvare-simulare-admiterepoli-1',
      label: 'Rezolvare Simulare AdmiterePoli #1',
    },
    {
      href: './subiecte',
      label: 'Vezi toată arhiva de subiecte',
      noMargin: true,
    },
  ],
} satisfies PdfPageData;
