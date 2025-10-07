// src/apps/indicadores/presentation/components/Debug/ResultsDebug.tsx
import React from 'react';
import { useResults } from '../../hooks/useResults';

const ResultsDebug: React.FC = () => {
  const { results, detailedResults, indicators, headquarters, loading, error } = useResults();

  return (
    <div className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg m-4">
      <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-4">
        🐛 Debug - Estado de Resultados
      </h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">Loading:</span> {loading.toString()}
        </div>
        <div>
          <span className="font-semibold">Error:</span> {error || 'null'}
        </div>
        <div>
          <span className="font-semibold">Total Resultados:</span> {results.length}
        </div>
        <div>
          <span className="font-semibold">Total Resultados Detallados:</span> {detailedResults.length}
        </div>
        <div>
          <span className="font-semibold">Total Indicadores:</span> {indicators.length}
        </div>
        <div>
          <span className="font-semibold">Total Sedes:</span> {headquarters.length}
        </div>
        
        {detailedResults.length > 0 && (
          <div>
            <span className="font-semibold">Primer Resultado Detallado:</span>
            <pre className="bg-yellow-200 dark:bg-yellow-700 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(detailedResults[0], null, 2)}
            </pre>
          </div>
        )}
        
        {results.length > 0 && (
          <div>
            <span className="font-semibold">Primer Resultado Simple:</span>
            <pre className="bg-yellow-200 dark:bg-yellow-700 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(results[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDebug;