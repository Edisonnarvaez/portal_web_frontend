import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  data: any[];
  loading: boolean;
}

function formatLabel(item: any) {
  switch (item.measurementFrequency) {
    case "monthly":
      return `${item.year}-${String(item.month).padStart(2, "0")}`;
    case "quarterly":
      return `Q${item.quarter} ${item.year}`;
    case "semesterly":
      return `S${item.semester} ${item.year}`;
    case "annually":
      return `${item.year}`;
    default:
      return `${item.year}`;
  }
}

export default function TimeSeriesChart({ data, loading }: Props) {
  if (loading) return <p className="text-center">Cargando gráfico temporal...</p>;
  if (data.length === 0) return <p className="text-center">No hay datos para mostrar con los filtros seleccionados.</p>;

  const chartData = data
    .map((item) => ({
      label: formatLabel(item),
      resultado: Number(item.calculatedValue ?? item.calculated_value ?? item.value ?? 0),
      meta: Number(item.target ?? 0),
    }))
    .sort((a, b) => a.label.localeCompare(b.label)); // ordenar por fecha/etiqueta

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Evolución temporal del indicador</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="resultado" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="meta" stroke="#10b981" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
