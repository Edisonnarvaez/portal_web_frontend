import React, { useState, useEffect } from 'react';
import { FaFileWord, FaSpinner } from 'react-icons/fa';
import mammoth from 'mammoth';

interface WordViewerStandaloneProps {
  documentBlob?: Blob;
  documentTitle: string;
}

export default function WordViewerStandalone({
  documentBlob,
  documentTitle
}: WordViewerStandaloneProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(!!documentBlob);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (documentBlob) {
      const loadDocument = async () => {
        try {
          const arrayBuffer = await documentBlob.arrayBuffer();
          const result = await mammoth.convertToHtml({ 
            arrayBuffer
          });
          
          // Aplicar estilos CSS adicionales al HTML
          const styledHtml = `
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
              h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: bold; }
              h3 { font-size: 1.25em; margin: 0.83em 0; font-weight: bold; }
              p { margin: 0.5em 0; line-height: 1.5; }
              img { max-width: 100%; height: auto; margin: 0.5em 0; }
              table { border-collapse: collapse; margin: 1em 0; width: 100%; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              strong { font-weight: bold; }
              em { font-style: italic; }
            </style>
            ${result.value}
          `;
          
          setHtmlContent(styledHtml);
          setError('');
        } catch (error) {
          console.error('Error loading Word document:', error);
          setError('Error al cargar el documento. El archivo puede estar corrupto.');
          setHtmlContent('');
        } finally {
          setLoading(false);
        }
      };
      loadDocument();
    }
  }, [documentBlob]);

  if (!documentBlob) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <FaFileWord className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {documentTitle}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            No hay documento disponible para previsualizsar
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <FaFileWord className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center">
          <h4 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">Error</h4>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <FaSpinner className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Cargando documento...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-2">
          <FaFileWord className="text-blue-600 dark:text-blue-400 text-lg" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
            {documentTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Vista previa de alta fidelidad</p>
      </div>

      {/* Document Preview */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-lg">
        <div 
          className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#1f2937'
          }}
        />
      </div>

      {/* Info Message */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-4 py-3 bg-slate-100 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600">
        <strong>ℹ️ Vista previa:</strong> Se ha optimizado para mostrar el contenido lo más fiel posible al documento original, incluyendo imágenes y estilos de formato.
      </div>
    </div>
  );
}