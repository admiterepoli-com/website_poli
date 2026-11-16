import type { PdfPageData } from './_schema';

export default {
  slug: 'simulare-2026-matematica-barem',
  title: 'Barem Simulare Politehnica 2026 – Matematică | AdmiterePoli',
  description:
    'Baremul oficial pentru simularea examenului de admitere la matematică, Universitatea Politehnica București (UPB) 2026. Verifică-ți răspunsurile!',
  h1: 'Barem Simulare Politehnica 2026 – Matematică',
  intro:
    'Aici găsești baremul oficial de corectare pentru simularea examenului de admitere la matematică, susținut la Universitatea Politehnica București (UPB) în 2026. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: './rezolvare-simulare-2026-matematica',
      label: 'Vezi rezolvarea scrisă la Matematică',
    },
    {
      href: 'https://www.youtube.com/watch?v=1qCOqhuo42Q',
      label: 'Vezi rezolvarea video (Matematică)',
      external: true,
    },
    {
      href: './simulare-2026-informatica-barem',
      label: 'Vezi baremul la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/simulare2026-mate-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
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
