import type { PdfPageData } from './_schema';

export default {
  slug: 'simulare-2023-informatica-barem',
  title: 'Barem Simulare Admitere Politehnica 2023 – Informatică | AdmiterePoli',
  description:
    'Baremul oficial pentru simularea examenului de admitere la informatică, Universitatea Politehnica București (UPB) 2023.',
  h1: 'Barem Simulare Politehnica 2023 – Informatică',
  intro:
    'Aici va fi publicat baremul oficial de corectare pentru simularea admiterii la informatică, organizată de Universitatea Națională de Știință și Tehnologie Politehnica București în 2023.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://www.reddit.com/r/Polytehnica/comments/11ouifn/simulare_upb_2023/',
      label: 'Subiecte Simulare 2023 (Reddit)',
      external: true,
    },
    {
      href: './simulare-2023-matematica-barem',
      label: 'Barem Simulare 2023 Matematică',
    },
    {
      href: 'https://www.youtube.com/watch?v=e8TjyyQG7Vw',
      label: 'Rezolvare Simulare 2023 Informatică (video)',
      external: true,
      noMargin: true,
    },
  ],
  pendingMessage: 'Baremul va fi disponibil în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './simulare-2024-informatica-barem',
      label: 'Barem Simulare 2024 Informatică',
    },
    {
      href: './admitere-2023-informatica-barem',
      label: 'Barem Admitere 2023 Informatică',
    },
  ],
} satisfies PdfPageData;
