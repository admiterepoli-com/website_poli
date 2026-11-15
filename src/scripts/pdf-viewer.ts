/**
 * Inline PDF viewer for the barem / subiect / rezolvare pages. Port of the
 * pdf.js snippet that every legacy page of that kind carried at the end of
 * <body> (see legacy/admitere-2025-matematica-barem.html).
 *
 * Rendering is kept as it was: one canvas per PDF page inside #pdfViewer,
 * scale min(1.3, containerWidth / pageWidth), devicePixelRatio-aware backing
 * store, canvases centred with a 20px bottom margin, same error markup.
 *
 * The one deliberate difference: legacy appended each canvas when its
 * getPage() promise resolved, so pages could land out of order. Here all pages
 * are still requested at once, but they are appended strictly in page order.
 */
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';

const MAX_SCALE = 1.3;

function renderPage(container: HTMLElement, page: PDFPageProxy): void {
  const baseViewport = page.getViewport({ scale: 1 });
  const containerWidth = container.clientWidth || window.innerWidth;
  const scale = Math.min(MAX_SCALE, containerWidth / baseViewport.width);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto 20px auto';
  const outputScale = window.devicePixelRatio || 1;
  const context = canvas.getContext('2d');
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + 'px';
  canvas.style.height = Math.floor(viewport.height) + 'px';

  container.appendChild(canvas);

  if (!context) return;
  page
    .render({ canvasContext: context, viewport, transform: [outputScale, 0, 0, outputScale, 0, 0] })
    .promise.catch((error: unknown) => console.error(error));
}

/** Same markup as legacy: <h2 style='text-align:center;margin-top:10%;color:white'>…</h2>. */
function showError(container: HTMLElement, message: string): void {
  const heading = document.createElement('h2');
  heading.setAttribute('style', 'text-align:center;margin-top:10%;color:white');
  heading.textContent = message;
  container.replaceChildren(heading);
}

/**
 * Renders the PDF named by `data-pdf-src` into #pdfViewer. If the document
 * cannot be loaded, the container shows `data-error-message` instead.
 */
export function initPdfViewer(): void {
  const container = document.getElementById('pdfViewer');
  if (!container) return;
  const url = container.dataset['pdfSrc'];
  if (!url) return;
  const errorMessage = container.dataset['errorMessage'] ?? '';

  GlobalWorkerOptions.workerSrc = workerSrc;

  getDocument(url)
    .promise.then(async (pdf) => {
      // Ask for every page up front (as legacy did), then place them in order.
      const pages: Promise<PDFPageProxy | null>[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pages.push(
          pdf.getPage(pageNum).catch((error: unknown) => {
            // A page that fails to load is skipped; the others still render.
            console.error(error);
            return null;
          }),
        );
      }
      for (const pending of pages) {
        const page = await pending;
        if (page) renderPage(container, page);
      }
    })
    .catch((error: unknown) => {
      showError(container, errorMessage);
      console.error(error);
    });
}
