import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  return (
    <div className="bg-white dark:bg-gray-900  w-full h-full overflow-hidden" 
    onContextMenu={(e) => e.preventDefault()}
    onMouseDown={(e) => e.preventDefault()}    // bloquea selección
    style={{ userSelect: 'none' }} 
    >
      <Worker workerUrl={workerUrl}>
        <Viewer fileUrl={fileUrl} />
      </Worker>
    </div>
  );
}

