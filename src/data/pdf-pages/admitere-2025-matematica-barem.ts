import type { PdfPageData } from './_schema';

export default {
  slug: 'admitere-2025-matematica-barem',
  title: 'Barem Admitere Politehnica 2025 – Matematică | AdmiterePoli',
  description:
    'Vezi baremul oficial pentru examenul final de admitere la matematică din anul 2025 de la Universitatea Politehnica București (UPB).',
  h1: 'Barem Admitere Politehnica 2025 – Matematică',
  intro:
    'Consultă baremul oficial de corectare pentru proba scrisă la matematică din cadrul examenului final de admitere la Universitatea Națională de Știință și Tehnologie Politehnica București (Sesiunea de Vară 2025).',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2025/Algebra_si_Elemente_de_Analiza_Matematica_AAM_(Varianta_S).pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: 'https://www.youtube.com/watch?v=IvdfNGfQIf0',
      label: 'Vezi rezolvarea video',
      external: true,
    },
    {
      href: './admitere-2025-informatica-barem',
      label: 'Vezi baremul la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/admitere2025-mate-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    { href: './preadmitere-2025-matematica-barem', label: 'Barem Preadmitere 2025 Matematică' },
    { href: './simulare-2025-matematica-barem', label: 'Barem Simulare 2025 Matematică' },
  ],
} satisfies PdfPageData;
