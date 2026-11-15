import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-admitere-2025-matematica',
  title: 'Rezolvare Admitere Politehnica 2025 – Matematică | AdmiterePoli',
  description:
    'Rezolvarea și baremul oficial pentru examenul de admitere la matematică, Universitatea Politehnica București (UPB) 2025. Verifică-ți răspunsurile!',
  h1: 'Rezolvare Admitere Politehnica 2025 – Matematică',
  intro:
    'Aici găsești rezolvarea detaliată și baremul pentru examenul de admitere la matematică, susținut la Universitatea Politehnica București (UPB) în vara anului 2025. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://www.youtube.com/watch?v=CA4ylt19zEA',
      label: 'Vezi rezolvarea video (Matematică)',
      external: true,
    },
    {
      href: './rezolvare-admitere-2025-informatica',
      label: 'Vezi rezolvarea la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/admitere2025-mate-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvarii.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    { href: './simulare-2025-matematica-barem', label: 'Barem Simulare 2025 Matematică' },
    { href: './preadmitere-2025-matematica-barem', label: 'Barem Preadmitere 2025 Matematică' },
  ],
} satisfies PdfPageData;
