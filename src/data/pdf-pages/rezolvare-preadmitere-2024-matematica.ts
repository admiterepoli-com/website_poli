import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-preadmitere-2024-matematica',
  title: 'Rezolvare Preadmitere Politehnica 2024 – Matematică | AdmiterePoli',
  description:
    'Rezolvarea completă pentru subiectul de matematică de la preadmiterea Politehnica București 2024. Soluții explicate pas cu pas de studenți la Automatică și Calculatoare.',
  h1: 'Rezolvare Preadmitere Politehnica 2024 – Matematică',
  intro:
    'Aceasta este rezolvarea completă pentru subiectul de matematică de la preadmiterea Politehnica București 2024. Soluțiile sunt explicate pas cu pas de studenți de la Automatică și Calculatoare și urmăresc metoda oficială de rezolvare.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2024/Admitere_anticipata_2024/Algebra_si_Elemente_de_Analiza_Matematica_AAM_(Varianta_F).pdf',
      label: 'Vezi subiectul original (PDF)',
      external: true,
    },
    {
      href: './preadmitere-2024-matematica-barem',
      label: 'Vezi baremul',
    },
    {
      href: 'https://www.youtube.com/watch?v=fc4mHDIIhBo',
      label: 'Vezi rezolvarea video la mate',
      external: true,
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2024-mate-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvării.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './preadmitere-2024-matematica-barem',
      label: 'Barem Preadmitere 2024 Matematică',
    },
    {
      href: './simulare-2024-matematica-barem',
      label: 'Barem Simulare 2024 Matematică',
    },
  ],
} satisfies PdfPageData;
