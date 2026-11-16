import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2025-info-subiect',
  title: 'Subiect Preadmitere Politehnica 2025 – Informatică | AdmiterePoli',
  description:
    'Subiectul oficial de informatică de la preadmiterea Politehnica București 2025. Pregătește-te eficient cu AdmiterePoli.',
  h1: 'Subiect Preadmitere Politehnica 2025 – Informatică',
  intro:
    'Acesta este subiectul oficial dat la proba de informatică pentru preadmiterea la Universitatea Națională de Știință și Tehnologie Politehnica București în anul 2025.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile pentru acest subiect:',
  usefulLinks: [
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Vezi baremul oficial de corectare (Info)',
    },
    {
      href: 'https://www.youtube.com/watch?v=Z73qI8v-h_A&pp=0gcJCfwAo7VqN5tD',
      label: 'Vezi rezolvarea video explicată',
      external: true,
    },
    {
      href: './rezolvare-preadmitere-2025-matematica',
      label: 'Vezi rezolvarea completă la proba de Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2025-info-subiect.pdf',
  errorMessage: 'A apărut o eroare la încărcarea subiectului.',
  relatedHeading: 'Mai exersează la Informatică (Anul 2025):',
  related: [
    {
      href: './simulare-2025-informatica-barem',
      label: 'Barem Simulare 2025 – Informatică',
    },
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere 2025 – Informatică',
    },
    {
      href: './rezolvare-admitere-2025-informatica',
      label: 'Rezolvare Admitere 2025 – Informatică',
      noMargin: true,
    },
  ],
} satisfies PdfPageData;
