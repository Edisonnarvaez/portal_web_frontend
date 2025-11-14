/**
 * 🔍 PÁGINA DE DIAGNÓSTICO DE API
 * Prueba cada endpoint de forma independiente para identificar exactamente cuál está fallando
 */

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';

interface EndpointTest {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  data?: any;
  error?: string;
  responseTime?: number;
}

const DiagnosticoAPI: React.FC = () => {
  const [tests, setTests] = useState<EndpointTest[]>([
    { name: '📊 GET /indicators/results/', url: '/indicators/results/', method: 'GET', status: 'pending' },
    { name: '📋 GET /indicators/results/detailed/', url: '/indicators/results/detailed/', method: 'GET', status: 'pending' },
    { name: '🏢 GET /indicators/indicators/', url: '/indicators/indicators/', method: 'GET', status: 'pending' },
    { name: '🏭 GET /companies/headquarters/', url: '/companies/headquarters/', method: 'GET', status: 'pending' },
  ]);

  const [running, setRunning] = useState(false);

  const runTest = async (endpoint: EndpointTest, index: number) => {
    const startTime = performance.now();
    
    try {
      //console.log(`🔄 Testing: ${endpoint.name}`);
      const response = await axiosInstance.get(endpoint.url);
      const responseTime = performance.now() - startTime;
      
      const updated = { ...endpoint };
      updated.status = 'success';
      updated.statusCode = response.status;
      updated.data = response.data;
      updated.responseTime = responseTime;
      
      //console.log(`✅ ${endpoint.name} SUCCESS (${responseTime.toFixed(2)}ms)`, response.data);
      
      setTests(prev => {
        const newTests = [...prev];
        newTests[index] = updated;
        return newTests;
      });
    } catch (error: any) {
      const responseTime = performance.now() - startTime;
      
      const updated = { ...endpoint };
      updated.status = 'failed';
      updated.statusCode = error.response?.status;
      updated.error = error.response?.data?.detail || error.message || String(error);
      updated.responseTime = responseTime;
      
      //console.error(`❌ ${endpoint.name} FAILED (${responseTime.toFixed(2)}ms)`, error);
      
      setTests(prev => {
        const newTests = [...prev];
        newTests[index] = updated;
        return newTests;
      });
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    // Reset all tests to pending
    setTests(prev => prev.map(t => ({ ...t, status: 'pending', data: undefined, error: undefined })));
    
    // Run all tests sequentially
    for (let i = 0; i < tests.length; i++) {
      await runTest(tests[i], i);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setRunning(false);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">🔍 Diagnóstico de API</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Esta página prueba cada endpoint de la API de forma independiente para identificar exactamente cuál está fallando.
        </p>

        <button
          onClick={runAllTests}
          disabled={running}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
        >
          {running ? '⏳ Ejecutando pruebas...' : '▶️ Ejecutar todas las pruebas'}
        </button>

        <div className="space-y-4">
          {tests.map((test, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg border-2 ${
                test.status === 'pending'
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  : test.status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{test.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{test.url}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl">
                    {test.status === 'pending' && '⏳'}
                    {test.status === 'success' && '✅'}
                    {test.status === 'failed' && '❌'}
                  </div>
                  {test.responseTime && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{test.responseTime.toFixed(2)}ms</p>
                  )}
                </div>
              </div>

              {test.status === 'failed' && test.error && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/50 rounded border border-red-300 dark:border-red-700">
                  <p className="font-mono text-sm text-red-900 dark:text-red-200">{test.error}</p>
                </div>
              )}

              {test.status === 'success' && test.data && (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/50 rounded border border-green-300 dark:border-green-700">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                    ✅ Respuesta ({test.statusCode}):
                  </p>
                  <pre className="text-xs overflow-auto max-h-40 text-green-900 dark:text-green-200">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Próximos pasos:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Si todos los tests son ✅, el problema está en el frontend (mirar ErrorBoundary)</li>
            <li>Si alguno es ❌, necesitas revisar ese endpoint en el backend</li>
            <li>Abre la consola del navegador (F12) para ver los logs detallados</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoAPI;
