import type { PdfPageData } from './_schema';

export default {
  slug: 'admitere-2025-informatica-barem',
  title: 'Barem Admitere Politehnica 2025 – Informatică | AdmiterePoli',
  description:
    'Vezi baremul oficial pentru examenul final de admitere la informatică din anul 2025 de la Universitatea Politehnica București (UPB).',
  h1: 'Barem Admitere Politehnica 2025 – Informatică',
  intro:
    'Aici este publicat baremul oficial de corectare pentru proba scrisă la informatică din cadrul examenului de admitere la Universitatea Națională de Știință și Tehnologie Politehnica București (Sesiunea de Vară 2025).',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2025/Algebra_si_Elemente_de_Analiza_Matematica_AAM_(Varianta_S).pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './rezolvare-admitere-2025-informatica',
      label: 'Vezi rezolvarea completă',
    },
    {
      href: './admitere-2025-matematica-barem',
      label: 'Vezi baremul la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/admitere2025-info-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Barem Preadmitere 2025 Informatică',
    },
    {
      href: './simulare-2025-informatica-barem',
      label: 'Barem Simulare 2025 Informatică',
    },
  ],
} satisfies PdfPageData;
