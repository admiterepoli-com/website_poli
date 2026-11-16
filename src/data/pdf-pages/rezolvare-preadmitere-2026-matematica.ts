import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-preadmitere-2026-matematica',
  title: 'Rezolvare Preadmitere Politehnica 2026 – Matematică | AdmiterePoli',
  description:
    'Rezolvarea și baremul oficial pentru preadmiterea examenului de admitere la matematică, Universitatea Politehnica București (UPB) 2026. Verifică-ți răspunsurile!',
  h1: 'Rezolvare Preadmitere Politehnica 2026 – Matematică',
  intro:
    'Aici găsești rezolvarea detaliată și baremul pentru preadmiterea examenului de admitere la matematică, susținut la Universitatea Politehnica București (UPB) în 2026. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: './preadmitere-2026-matematica-barem',
      label: 'Vezi baremul la Matematică',
    },
    {
      href: './preadmitere-2026-mate-subiect',
      label: 'Vezi subiectul la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2026-mate-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvarii.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './rezolvare-simulare-2026-matematica',
      label: 'Rezolvare Simulare 2026 Matematică',
    },
    {
      href: './rezolvare-preadmitere-2025-matematica',
      label: 'Rezolvare Preadmitere 2025 Matematică',
    },
  ],
  strayCommentEnd: true,
} satisfies PdfPageData;
