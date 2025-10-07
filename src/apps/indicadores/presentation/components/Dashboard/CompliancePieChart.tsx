import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: any[];
  loading: boolean;
}

const COLORS = ["#10b981", "#ef4444"]; // verde y rojo

export default function CompliancePieChart({ data, loading }: Props) {
  if (loading) return <p className="text-center">Cargando gráfico de cumplimiento...</p>;
  if (data.length === 0) return <p className="text-center">No hay datos disponibles.</p>;

  // Agrupar por sede y calcular % de cumplimiento
  const grouped: Record<string, { cumplidos: number; noCumplidos: number }> = data.reduce(
    (acc, curr) => {
      const sede = curr.headquarterName;
      const cumple = curr.calculatedValue >= curr.target;

      if (!acc[sede]) acc[sede] = { cumplidos: 0, noCumplidos: 0 };

      if (cumple) acc[sede].cumplidos += 1;
      else acc[sede].noCumplidos += 1;

      return acc;
    },
    {}
  );

  // Crear datos para el gráfico
  const chartData = Object.entries(grouped).flatMap(([sede, val]) => [
    { name: `${sede} (Cumple)`, value: val.cumplidos, sede },
    { name: `${sede} (No cumple)`, value: val.noCumplidos, sede },
  ]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Cumplimiento por sede</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.name.includes("No") ? COLORS[1] : COLORS[0]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
