import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-preadmitere-2026-informatica',
  title: 'Rezolvare Preadmitere Politehnica 2026 – Informatică | AdmiterePoli',
  description:
    'Rezolvarea și baremul oficial pentru preadmiterea examenului de admitere la informatică, Universitatea Politehnica București (UPB) 2026. Verifică-ți răspunsurile!',
  h1: 'Rezolvare Preadmitere Politehnica 2026 – Informatică',
  intro:
    'Aici găsești rezolvarea detaliată și baremul pentru preadmiterea examenului de admitere la informatică, susținut la Universitatea Politehnica București (UPB) în 2026. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: './preadmitere-2026-informatica-barem',
      label: 'Vezi baremul la Informatică',
    },
    {
      href: './rezolvare-preadmitere-2026-matematica',
      label: 'Vezi rezolvarea la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2026-info-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvarii.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './rezolvare-simulare-2026-informatica',
      label: 'Rezolvare Simulare 2026 Informatică',
    },
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Barem Preadmitere 2025 Informatică',
    },
  ],
  strayCommentEnd: true,
} satisfies PdfPageData;
