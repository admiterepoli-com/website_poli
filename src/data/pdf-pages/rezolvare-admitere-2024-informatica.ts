import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-admitere-2024-informatica',
  title: 'Rezolvare Admitere Politehnica 2024 – Informatică | AdmiterePoli',
  description:
    'Rezolvarea completă pentru examenul de admitere la informatică, Universitatea Politehnica București (UPB) 2024.',
  h1: 'Rezolvare Admitere Politehnica 2024 – Informatică',
  intro:
    'Aici va fi publicată rezolvarea completă pentru subiectul de informatică din cadrul examenului de admitere la Universitatea Națională de Știință și Tehnologie Politehnica București, 2024.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2024/Informatica_I_(Varianta_A).pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './admitere-2024-informatica-barem',
      label: 'Barem Admitere 2024 Informatică',
    },
    {
      href: 'https://www.youtube.com/watch?v=gbX0MePdi70',
      label: 'Rezolvare Admitere 2024 Matematică (video)',
      external: true,
      noMargin: true,
    },
  ],
  pendingMessage: 'Rezolvarea va fi disponibilă în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './rezolvare-admitere-2025-informatica',
      label: 'Rezolvare Admitere 2025 Informatică',
    },
    {
      href: './admitere-2024-informatica-barem',
      label: 'Barem Admitere 2024 Informatică',
    },
  ],
} satisfies PdfPageData;
