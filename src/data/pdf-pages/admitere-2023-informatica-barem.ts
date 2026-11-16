import type { PdfPageData } from './_schema';

export default {
  slug: 'admitere-2023-informatica-barem',
  title: 'Barem Admitere Politehnica 2023 – Informatică | AdmiterePoli',
  description:
    'Baremul oficial pentru examenul de admitere la informatică, Universitatea Politehnica București (UPB) 2023.',
  h1: 'Barem Admitere Politehnica 2023 – Informatică',
  intro:
    'Aici va fi publicat baremul oficial de corectare pentru proba scrisă la informatică din cadrul examenului de admitere la Universitatea Națională de Știință și Tehnologie Politehnica București, 2023.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2023/Informatica_I_(Varianta_S).pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './admitere-2023-matematica-barem',
      label: 'Barem Admitere 2023 Matematică',
    },
    {
      href: './rezolvare-admitere-2023-informatica',
      label: 'Rezolvare Admitere 2023 Informatică',
      noMargin: true,
    },
  ],
  pendingMessage: 'Baremul va fi disponibil în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere 2025 Informatică',
    },
    {
      href: './admitere-2024-informatica-barem',
      label: 'Barem Admitere 2024 Informatică',
    },
  ],
} satisfies PdfPageData;
