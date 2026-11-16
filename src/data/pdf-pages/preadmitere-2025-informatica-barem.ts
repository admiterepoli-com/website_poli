import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2025-informatica-barem',
  title: 'Barem Preadmitere Politehnica 2025 – Informatică | AdmiterePoli',
  description:
    'Baremul oficial pentru examenul de preadmitere la informatică, Universitatea Politehnica București (UPB) 2025. Verifică-ți răspunsurile!',
  h1: 'Barem Preadmitere Politehnica 2025 – Informatică',
  intro:
    'Acesta este baremul oficial de notare pentru examenul de preadmitere la informatică, susținut la Universitatea Politehnica București (UPB) în 2025. Asigură-te că ai confruntat grilele cu răspunsurile de aici.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://www.youtube.com/watch?v=Z73qI8v-h_A&ab_channel=ZecelaExamene',
      label: 'Vezi subiectul original (Video)',
      external: true,
    },
    {
      href: 'https://www.youtube.com/watch?v=Z73qI8v-h_A&pp=0gcJCfwAo7VqN5tD',
      label: 'Vezi rezolvarea video',
      external: true,
    },
    {
      href: './preadmitere-2025-matematica-barem',
      label: 'Vezi baremul la Matematică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2025-info-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere 2025 Informatică',
    },
    {
      href: './simulare-2025-informatica-barem',
      label: 'Barem Simulare 2025 Informatică',
    },
  ],
} satisfies PdfPageData;
