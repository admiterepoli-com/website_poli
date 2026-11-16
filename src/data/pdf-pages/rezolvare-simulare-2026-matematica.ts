import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-simulare-2026-matematica',
  title: 'Rezolvare Simulare Politehnica 2026 – Matematică | AdmiterePoli',
  description:
    'Rezolvarea și baremul oficial pentru simularea examenului de admitere la matematică, Universitatea Politehnica București (UPB) 2026. Verifică-ți răspunsurile!',
  h1: 'Rezolvare Simulare Politehnica 2026 – Matematică',
  intro:
    'Aici găsești rezolvarea detaliată și baremul pentru simularea examenului de admitere la matematică, susținut la Universitatea Politehnica București (UPB) în 2026. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://www.youtube.com/watch?v=1qCOqhuo42Q',
      label: 'Vezi rezolvarea video (Matematică)',
      external: true,
    },
    {
      href: './simulare-2026-informatica-barem',
      label: 'Vezi rezolvarea la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/simulare2026-mate-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvarii.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-matematica-barem',
      label: 'Barem Admitere 2025 Matematică',
    },
    {
      href: './preadmitere-2025-matematica-barem',
      label: 'Barem Preadmitere 2025 Matematică',
    },
  ],
} satisfies PdfPageData;
