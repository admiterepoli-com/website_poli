import type { PdfPageData } from './_schema';

export default {
  slug: 'preadmitere-2024-matematica-barem',
  title: 'Barem Preadmitere Politehnica 2024 – Informatică | AdmiterePoli',
  description:
    'Baremul oficial pentru examenul de preadmitere la informatică, Universitatea Politehnica București (UPB) 2024. Verifică-ți răspunsurile!',
  h1: 'Barem Preadmitere Politehnica 2024 – Informatică',
  intro:
    'Acesta este baremul oficial de notare pentru examenul de preadmitere la informatică, susținut la Universitatea Politehnica București (UPB) în 2024. Asigură-te că ai confruntat grilele cu răspunsurile de aici.',
  variant: 'inline',
  usefulLinksHeading: '🔗 Linkuri utile:',
  usefulLinks: [
    {
      href: 'http://www.physics.pub.ro/Admitere/2024/Admitere_anticipata_2024/Algebra_si_Elemente_de_Analiza_Matematica_AAM_(Varianta_F).pdf',
      label: 'Vezi subiectul original',
      external: true,
    },
    {
      href: 'rezolvare-preadmitere-2024-matematica.html',
      label: 'Vezi rezolvarea scrisă',
      external: true,
    },
    {
      href: './preadmitere-2024-informatica-barem',
      label: 'Vezi baremul la Informatică',
      noMargin: true,
    },
  ],
  pdf: 'pdfs/preadmitere2024-mate-barem.pdf',
  errorMessage: 'A apărut o eroare la încărcarea baremului.',
  relatedHeading: 'Subiecte similare care te-ar putea ajuta:',
  related: [
    {
      href: './admitere-2024-informatica-barem',
      label: 'Barem Admitere 2024 Informatică',
    },
    {
      href: './simulare-2024-informatica-barem',
      label: 'Barem Simulare 2024 Informatică',
    },
  ],
} satisfies PdfPageData;
