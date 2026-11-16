import type { PdfPageData } from './_schema';

export default {
  slug: 'simulare-2025-informatica-barem',
  title: 'Barem Simulare Admitere Politehnica 2025 – Informatică | AdmiterePoli',
  description:
    'Vezi baremul oficial de corectare pentru simularea examenului de admitere la informatică, Universitatea Politehnica București (UPB) 2025.',
  h1: 'Barem Simulare Politehnica 2025 – Informatică',
  intro:
    'Aici găsești baremul oficial de corectare și notare pentru simularea examenului de admitere la informatică, organizată de Universitatea Națională de Știință și Tehnologie Politehnica București în 2025.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2025/Simulare_Admitere_2025/Informatica_(Varianta_B)_I-B_15.03.2025.pdf',
      label: 'Vezi subiectul oficial (PDF)',
      external: true,
    },
    {
      href: './simulare-2025-matematica-barem',
      label: 'Vezi baremul la Matematică',
    },
    {
      href: 'https://www.youtube.com/watch?v=DNt4iXbzpQo',
      label: 'Vezi rezolvarea video',
      external: true,
      noMargin: true,
    },
  ],
  pdf: 'pdfs/simulare2025-info-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Barem Preadmitere 2025 Informatică',
    },
    {
      href: './admitere-2025-informatica-barem',
      label: 'Barem Admitere 2025 Informatică',
    },
  ],
} satisfies PdfPageData;
