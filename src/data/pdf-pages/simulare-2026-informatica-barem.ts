import type { PdfPageData } from './_schema';

export default {
  slug: 'simulare-2026-informatica-barem',
  title: 'Barem Simulare Politehnica 2026 – Informatică | AdmiterePoli',
  description:
    'Baremul oficial pentru simularea examenului de admitere la informatică, Universitatea Politehnica București (UPB) 2026. Verifică-ți răspunsurile!',
  h1: 'Barem Simulare Politehnica 2026 – Informatică',
  intro:
    'Aici găsești baremul oficial de corectare pentru simularea examenului de admitere la informatică, susținut la Universitatea Politehnica București (UPB) în 2026. Asigură-te că ai confruntat grilele cu răspunsurile de mai jos.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: './rezolvare-simulare-2026-informatica',
      label: 'Vezi rezolvarea scrisă la Informatică',
    },
    {
      href: '#',
      label: 'Vezi rezolvarea video (Informatică)',
      external: true,
    },
    {
      href: './simulare-2026-matematica-barem',
      label: 'Vezi baremul la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/simulare2026-info-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere 2025 Informatică',
    },
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Barem Preadmitere 2025 Informatică',
    },
  ],
} satisfies PdfPageData;
