// src/apps/indicadores/presentation/components/Debug/IndicatorDebug.tsx
import React from 'react';
import { useIndicators } from '../../hooks/useIndicators';

const IndicatorDebug: React.FC = () => {
  const { indicators, processes, loading, error } = useIndicators();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg m-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        🐛 Debug - Estado de Indicadores
      </h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">Loading:</span> {loading.toString()}
        </div>
        <div>
          <span className="font-semibold">Error:</span> {error || 'null'}
        </div>
        <div>
          <span className="font-semibold">Total Indicadores:</span> {indicators.length}
        </div>
        <div>
          <span className="font-semibold">Total Procesos:</span> {processes.length}
        </div>
        
        {indicators.length > 0 && (
          <div>
            <span className="font-semibold">Primer Indicador:</span>
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(indicators[0], null, 2)}
            </pre>
          </div>
        )}
        
        {processes.length > 0 && (
          <div>
            <span className="font-semibold">Procesos:</span>
            <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(processes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicatorDebug;