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
          
          // CSS avanzado para máxima fidelidad con Office
          const styledHtml = `
            <style>
              /* Fuente por defecto - Calibri es la fuente de Word */
              body { 
                font-family: 'Calibri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 11pt;
                line-height: 1.15;
                color: #000000;
              }
              
              /* Párrafos normales */
              p { 
                margin: 0 0 6pt 0;
                line-height: 1.15;
                text-align: justify;
              }
              
              /* Encabezados estilo Office */
              h1 { 
                font-size: 28pt;
                margin: 12pt 0 6pt 0;
                font-weight: bold;
                color: #2c3e50;
                line-height: 1.15;
              }
              h2 { 
                font-size: 20pt;
                margin: 10pt 0 6pt 0;
                font-weight: bold;
                color: #34495e;
                line-height: 1.15;
              }
              h3 { 
                font-size: 14pt;
                margin: 8pt 0 6pt 0;
                font-weight: bold;
                color: #5d6d7b;
                line-height: 1.15;
              }
              h4 {
                font-size: 12pt;
                margin: 6pt 0 4pt 0;
                font-weight: bold;
                line-height: 1.15;
              }
              
              /* Listas */
              ul, ol {
                margin: 6pt 0;
                padding-left: 2.5em;
              }
              li {
                margin: 2pt 0;
                line-height: 1.15;
              }
              
              /* Tablas estilo Office */
              table {
                border-collapse: collapse;
                margin: 12pt 0;
                width: 100%;
                border: 1px solid #c5c5c5;
                font-size: 11pt;
              }
              th {
                background-color: #4472c4;
                color: white;
                border: 1px solid #4472c4;
                padding: 6pt 8pt;
                text-align: left;
                font-weight: bold;
                line-height: 1.15;
              }
              td {
                border: 1px solid #c5c5c5;
                padding: 6pt 8pt;
                line-height: 1.15;
              }
              tr:nth-child(even) {
                background-color: #f2f2f2;
              }
              
              /* Formatos de texto */
              strong, b { font-weight: bold; }
              em, i { font-style: italic; }
              u { text-decoration: underline; }
              del, s { text-decoration: line-through; }
              sup { vertical-align: super; font-size: 0.8em; }
              sub { vertical-align: sub; font-size: 0.8em; }
              
              /* Imágenes con sombra sutil */
              img {
                max-width: 100%;
                height: auto;
                margin: 8pt 0;
                border: 1px solid #d0d0d0;
                border-radius: 3px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              /* Citas en bloque */
              blockquote {
                border-left: 4px solid #4472c4;
                padding-left: 12pt;
                margin: 6pt 0;
                color: #666666;
                font-style: italic;
              }
              
              /* Código */
              code, pre {
                font-family: 'Courier New', Courier, monospace;
                background-color: #f5f5f5;
                padding: 2pt 4pt;
                border-radius: 3px;
                font-size: 10pt;
              }
              
              pre {
                padding: 8pt;
                overflow-x: auto;
              }
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
        
      </div>

      {/* Document Preview */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-lg">
        {/* Documento estilo Office - con márgenes y fondo blanco */}
        <div 
          className="flex-1 overflow-y-auto p-12 bg-white dark:bg-slate-960"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        />
      </div>

      {/* Info Message */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-4 py-3 bg-slate-100 dark:bg-slate-700/20 rounded-lg border border-slate-200 dark:border-slate-600">
        <strong>ℹ️ Vista previa:</strong> Se muestra una previsualizacion del contenido del documento, Se recomienda descargar para verlo en su formato completo.
      </div>
    </div>
  );
}