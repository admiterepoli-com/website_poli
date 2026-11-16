import type { PdfPageData } from './_schema';

export default {
  slug: 'rezolvare-admitere-2025-informatica',
  title: 'Rezolvare Admitere Politehnica 2025 – Informatică | AdmiterePoli',
  description:
    'Rezolvarea completă pentru subiectul de informatică de la admiterea Politehnica București (Sesiunea Vară) 2025. Soluții explicate de studenți la Automatică.',
  h1: 'Rezolvare Admitere Politehnica 2025 – Informatică',
  intro:
    'Aceasta este rezolvarea completă pentru subiectul de informatică din cadrul examenului final de admitere la Politehnica București, 2025. Fiecare grilă și algoritm sunt explicate detaliat de studenți pentru a te ajuta să înțelegi raționamentul din spatele răspunsurilor corecte.',
  variant: 'links-box',
  usefulLinksHeading: 'Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2025/Informatica_I_(Varianta_S).pdf',
      label: 'Vezi subiectul original (PDF)',
      external: true,
    },
    {
      href: './admitere-2025-informatica-barem',
      label: 'Vezi baremul oficial',
    },
    {
      href: 'https://www.youtube.com/watch?v=IvdfNGfQIf0',
      label: 'Vezi rezolvarea video la Matematică',
      external: true,
      noMargin: true,
    },
  ],
  pdf: 'pdfs/admitere2025-info-rezolvare.pdf',
  errorMessage: 'A apărut o eroare la încărcarea rezolvarii.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2025-matematica-barem',
      label: 'Barem Admitere 2025 Matematică',
    },
    {
      href: './preadmitere-2025-informatica-barem',
      label: 'Barem Preadmitere 2025 Informatică',
    },
  ],
} satisfies PdfPageData;
