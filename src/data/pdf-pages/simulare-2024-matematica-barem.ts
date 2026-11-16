import type { PdfPageData } from './_schema';

export default {
  slug: 'simulare-2024-matematica-barem',
  title: 'Barem Simulare Admitere Politehnica 2024 – Matematică | AdmiterePoli',
  description:
    'Baremul oficial pentru simularea examenului de admitere la matematică, Universitatea Politehnica București (UPB) 2024.',
  h1: 'Barem Simulare Politehnica 2024 – Matematică',
  intro:
    'Aici va fi publicat baremul oficial de corectare pentru simularea admiterii la matematică, organizată de Universitatea Națională de Știință și Tehnologie Politehnica București în 2024.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2024/Simulare_Admitere_2024/Algebra_si_Analiza_matematica_Subiect_C_simulare_2024.pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './simulare-2024-informatica-barem',
      label: 'Barem Simulare 2024 Informatică',
    },
    {
      href: './rezolvare-simulare-2024-matematica',
      label: 'Rezolvare Simulare 2024 Matematică',
      noMargin: true,
    },
  ],
  pendingMessage: 'Baremul va fi disponibil în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './simulare-2025-matematica-barem',
      label: 'Barem Simulare 2025 Matematică',
    },
    {
      href: './preadmitere-2024-matematica-barem',
      label: 'Barem Preadmitere 2024 Matematică',
    },
  ],
} satisfies PdfPageData;
