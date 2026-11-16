import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-preadmitere-2025-matematica',
  title: 'Rezolvare Preadmitere Politehnica 2025 – Matematică | AdmiterePoli',
  description:
    'Rezolvarea completă pentru subiectul de matematică de la preadmiterea Politehnica București 2025. Soluții explicate pas cu pas de studenți la Automatică și Calculatoare.',
  h1: 'Rezolvare Preadmitere Politehnica 2025 – Matematică',
  intro:
    'Aceasta este rezolvarea completă pentru subiectul de matematică de la preadmiterea Politehnica București 2025. Soluțiile sunt explicate pas cu pas de studenți de la Automatică și Calculatoare și urmăresc metoda oficială de rezolvare.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: 'https://mate.info.ro/UploadedMaterials/Mate.Info.Ro.5783%20Preadmitere%20UPB%202025%20-%20Subiecte%20Algebra%20si%20Analiza%20matematica.pdf',
      label: 'Vezi subiectul original (PDF)',
      external: true,
    },
    {
      href: './preadmitere-2025-matematica-barem',
      label: 'Vezi baremul oficial',
    },
    {
      href: 'https://www.youtube.com/watch?v=Z73qI8v-h_A&pp=0gcJCfwAo7VqN5tD',
      label: 'Vezi rezolvarea video la Informatică',
      external: true,
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2025-mate-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvării.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './preadmitere-2025-matematica-barem',
      label: 'Barem Preadmitere 2025 Matematică',
    },
    {
      href: './simulare-2025-matematica-barem',
      label: 'Barem Simulare 2025 Matematică',
    },
  ],
} satisfies PdfPageData;
