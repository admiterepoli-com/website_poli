import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2023-matematica-barem',
  title: 'Barem Preadmitere UPB 2023 – Matematică | AdmiterePoli',
  description:
    'Baremul oficial pentru preadmiterea la matematică, Universitatea Politehnica București (UPB) 2023.',
  h1: 'Barem Preadmitere UPB 2023 – Matematică',
  intro:
    'Aici va fi publicat baremul oficial de corectare pentru proba de matematică de la preadmiterea Universității Naționale de Știință și Tehnologie Politehnica București, 2023.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2023/Admitere_anticipata_2023/Algebra-Analiza_22.04.2023.pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './preadmitere-2023-informatica-barem',
      label: 'Barem Preadmitere 2023 Informatică',
    },
    {
      href: 'https://www.youtube.com/watch?v=bOaD0Bf4tWc',
      label: 'Rezolvare Preadmitere 2023 Matematică (video)',
      external: true,
      noMargin: true,
    },
  ],
  pendingMessage: 'Baremul va fi disponibil în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './preadmitere-2025-matematica-barem',
      label: 'Barem Preadmitere 2025 Matematică',
    },
    {
      href: './admitere-2023-matematica-barem',
      label: 'Barem Admitere 2023 Matematică',
    },
  ],
} satisfies PdfPageData;
