import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface Props {
  data: any[];
  loading: boolean;
  top?: number;
}

export default function WorstIndicatorsChart({ data, loading, top = 5 }: Props) {
  if (loading) return <p className="text-center">Cargando ranking...</p>;
  if (!data || data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

  // 🔧 CORREGIR: Calcular diferencia contra la meta con validación
  const ranked = useMemo(() => {
    console.log('🔍 Datos recibidos en WorstIndicatorsChart:', data);
    
    return data
      .map((item) => {
        // 🔧 Validar y convertir valores a números
        const calculatedValue = parseFloat(item.calculatedValue) || 0;
        const target = parseFloat(item.target) || 0;
        const diferencia = calculatedValue - target;
        
        console.log('📊 Procesando item:', {
          id: item.id,
          calculatedValue: calculatedValue,
          target: target,
          diferencia: diferencia,
          indicatorName: item.indicatorName,
          headquarterName: item.headquarterName
        });

        return {
          ...item,
          calculatedValue: calculatedValue,
          target: target,
          diferencia: diferencia,
          // 🔧 Asegurar que los nombres estén disponibles
          name: item.indicatorName || item.name || `Indicador ${item.id}`,
          sede: item.headquarterName || item.sede || 'Sin sede',
          // 🔧 Crear un identificador único para el gráfico
          displayName: `${item.indicatorCode || item.code || 'IND'} - ${item.headquarterName || 'Sin sede'}`
        };
      })
      .filter(item => !isNaN(item.diferencia)) // 🔧 Filtrar valores inválidos
      .sort((a, b) => a.diferencia - b.diferencia)
      .slice(0, top);
  }, [data, top]);

  console.log('📈 Datos procesados para gráfico:', ranked);

  if (ranked.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Peores Indicadores
        </h3>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay datos válidos para mostrar el ranking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Peores Indicadores (Top {top})
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={ranked}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="displayName" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis 
            label={{ value: 'Diferencia vs Meta', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              // 🔧 CORREGIR: Validar que value sea un número antes de usar toFixed
              const numValue = parseFloat(value);
              if (isNaN(numValue)) {
                return ['N/A', name];
              }
              return [numValue.toFixed(2), name];
            }}
            labelFormatter={(label) => `Indicador: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {data.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sede: {data.sede}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valor actual: {data.calculatedValue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Meta: {data.target.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium ${
                      data.diferencia < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Diferencia: {data.diferencia.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="diferencia" 
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="diferencia" 
              position="top" 
              formatter={(value: any) => {
                // 🔧 CORREGIR: Validar que value sea un número antes de usar toFixed
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                  return 'N/A';
                }
                return numValue.toFixed(1);
              }}
              style={{ fontSize: '12px', fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}