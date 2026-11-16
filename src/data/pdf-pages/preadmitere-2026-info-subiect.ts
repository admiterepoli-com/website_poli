import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2026-info-subiect',
  title: 'Subiect Preadmitere Politehnica 2026 – Informatică | AdmiterePoli',
  description:
    'Subiectul oficial de informatică de la preadmiterea Politehnica București 2026. Pregătește-te eficient cu AdmiterePoli.',
  h1: 'Subiect Preadmitere Politehnica 2026 – Informatică',
  intro:
    'Acesta este subiectul oficial dat la proba de informatică pentru preadmiterea la Universitatea Națională de Știință și Tehnologie Politehnica București în anul 2026.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile pentru acest subiect:',
  usefulLinks: [
    {
      href: './preadmitere-2026-informatica-barem',
      label: 'Vezi baremul de corectare (Info)',
    },
    {
      href: './rezolvare-preadmitere-2026-informatica',
      label: 'Vezi rezolvarea completă la Informatică',
    },
    {
      href: './preadmitere-2026-mate-subiect',
      label: 'Vezi subiectul la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2026-info-subiect.pdf',
  errorMessage: 'A apărut o eroare la încărcarea subiectului.',
  relatedHeading: 'Mai exersează la Informatică (Anul 2026):',
  related: [
    {
      href: './simulare-2026-informatica-barem',
      label: 'Barem Simulare 2026 – Informatică',
    },
    {
      href: './rezolvare-simulare-2026-informatica',
      label: 'Rezolvare Simulare 2026 – Informatică',
    },
    {
      href: './preadmitere-2025-info-subiect',
      label: 'Subiect Preadmitere 2025 – Informatică',
      noMargin: true,
    },
  ],
  strayCommentEnd: true,
} satisfies PdfPageData;
