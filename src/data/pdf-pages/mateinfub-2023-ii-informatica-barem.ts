import type { PdfPageData } from './_schema';

export default {
  slug: 'mateinfub-2023-ii-informatica-barem',
  title: 'Barem MateInfoUB 2023 Runda II – Informatică | AdmiterePoli',
  description:
    'Baremul pentru MateInfoUB 2023 Runda II – Informatică, concursul de admitere organizat de Universitatea din București.',
  h1: 'Barem MateInfoUB 2023 Runda II – Informatică',
  intro:
    'Aici va fi publicat baremul pentru proba de informatică din cadrul concursului MateInfoUB 2023, Runda II, organizat de Universitatea din București.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://drive.google.com/file/d/1H1GZS1neiHZ8NEwKJaENlJIXU68AXicJ/view',
      label: 'Subiect MateInfoUB II 2023 Matematică (Drive)',
      external: true,
    },
    {
      href: 'https://drive.google.com/file/d/1ewfcSDsKZN-6LSSIqV2hdQ6YwOAog5Oo/view',
      label: 'Subiect MateInfoUB II 2023 Informatică (Drive)',
      external: true,
    },
    {
      href: './rezolvare-mateinfub-2023-ii-informatica',
      label: 'Rezolvare MateInfoUB II 2023 Informatică',
      noMargin: true,
    },
  ],
  pendingMessage: 'Baremul va fi disponibil în curând.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere Politehnica 2025 Informatică',
    },
    {
      href: './admitere-2023-informatica-barem',
      label: 'Barem Admitere Politehnica 2023 Informatică',
    },
  ],
} satisfies PdfPageData;
