import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2025-matematica-barem',
  title: 'Barem Preadmitere Politehnica 2025 – Matematică | AdmiterePoli',
  description:
    'Baremul oficial pentru examenul de preadmitere la matematică, Universitatea Politehnica București (UPB) 2025. Verifică-ți răspunsurile!',
  h1: 'Barem Preadmitere Politehnica 2025 – Matematică',
  intro:
    'Verifică baremul oficial de notare pentru examenul de preadmitere la matematică, susținut la Universitatea Politehnica București (UPB) în anul 2025. Află care au fost răspunsurile corecte pentru fiecare grilă.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://mate.info.ro/UploadedMaterials/Mate.Info.Ro.5783%20Preadmitere%20UPB%202025%20-%20Subiecte%20Algebra%20si%20Analiza%20matematica.pdf',
      label: 'Vezi subiectul original (PDF)',
      external: true,
    },
    {
      href: './rezolvare-preadmitere-2025-matematica',
      label: 'Vezi rezolvarea completă (pas cu pas)',
    },
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Vezi baremul la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2025-mate-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-matematica-barem',
      label: 'Barem Admitere 2025 Matematică',
    },
    {
      href: './simulare-2025-matematica-barem',
      label: 'Barem Simulare 2025 Matematică',
    },
  ],
} satisfies PdfPageData;
