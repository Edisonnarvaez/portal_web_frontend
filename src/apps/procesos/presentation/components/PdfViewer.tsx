import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

interface PdfViewerProps {
  fileUrl: string;
  // Añadimos esta prop para pasar la instancia del plugin al padre
  onPluginInit?: (instance: any) => void;
}

export default function PdfViewer({ fileUrl, onPluginInit }: PdfViewerProps) {
  // Inicializamos el plugin una sola vez
  const zoomPluginInstance = zoomPlugin();

  // Informamos al padre sobre la instancia para que pueda renderizar los botones
  React.useEffect(() => {
    if (onPluginInit) {
      onPluginInit(zoomPluginInstance);
    }
  }, []);

  return (
    <div 
      className="flex flex-col h-full w-full bg-[#525659]"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      <div className="flex-1 overflow-auto">
        <Worker workerUrl={workerUrl}>
          <Viewer 
            fileUrl={fileUrl}
            plugins={[zoomPluginInstance]}
            defaultScale={1.5} 
          />
        </Worker>
      </div>
    </div>
  );
}