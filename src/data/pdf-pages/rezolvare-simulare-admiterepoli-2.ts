import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-simulare-admiterepoli-2',
  title: 'Rezolvare Simulare Informatică și Matematică | AdmiterePoli 2',
  description:
    'Rezolvarea completă, pas cu pas, a subiectelor de informatică și matematică de la simularea AdmiterePoli.',
  h1: 'Rezolvare Simulare Informatică și Matematică',
  intro:
    'Aici găsești rezolvarea detaliată, pas cu pas, pentru subiectele combinate de la proba de Informatică și Matematică. Parcurge explicațiile pentru a înțelege exact cum se abordează fiecare problemă.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile pentru această simulare:',
  usefulLinks: [
    {
      href: './simulare-2026-03-26',
      label: 'Rezolva Subiectul',
    },
    {
      href: './barem-simulare-admiterepoli-2',
      label: 'Vezi baremul de corectare',
    },
  ],
  pdf: 'pdfs/rezolvare-simulare-admiterepoli-2.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvării.',
  relatedHeading: 'Mai exersează:',
  related: [
    {
      href: './rezolvare-preadmitere-2025-matematica',
      label: 'Rezolvare Preadmitere 2025 – Matematică',
    },
    {
      href: './rezolvare-simulare-2026-informatica.html',
      label: 'Rezolvare Simulare 2026 – Informatica',
    },
    {
      href: './subiecte',
      label: 'Vezi toată arhiva de subiecte',
      noMargin: true,
    },
  ],
} satisfies PdfPageData;
