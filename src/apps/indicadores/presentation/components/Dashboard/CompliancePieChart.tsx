import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { getHeadquarterField, safeNumber } from '../../utils/dataHelpers';

interface Props {
  data: any[];
  loading: boolean;
}

const COLORS = ["#10b981", "#ef4444"]; // verde y rojo

// Funciones de transformación al español
const transformComplianceStatusToSpanish = (status: string): string => {
  const statusMap: Record<string, string> = {
    'complies': 'Cumple ✓',
    'cumple': 'Cumple ✓',
    'does not comply': 'No Cumple ✗',
    'no cumple': 'No Cumple ✗',
    'compliant': 'Cumplente ✓',
    'non-compliant': 'No Cumplente ✗',
  };
  return statusMap[status.toLowerCase()] || status;
};

export default function CompliancePieChart({ data, loading }: Props) {
  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Dynamic colors based on dark mode
  const chartColors = {
    tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipText: isDarkMode ? '#e5e7eb' : '#1f2937',
    axisText: isDarkMode ? '#9ca3af' : '#666',
  };

  if (loading) return <p className="text-center">Cargando gráfico de cumplimiento...</p>;
  if (data.length === 0) return <p className="text-center">No hay datos disponibles.</p>;

  // Agrupar por sede y calcular % de cumplimiento
  const grouped: Record<string, { cumplidos: number; noCumplidos: number; details: any[] }> = data.reduce(
    (acc, curr) => {
      const sede = curr.headquarterName ?? getHeadquarterField(curr, 'name', 'Sin sede');

      // If the backend provided a compliant boolean, use it; otherwise fall back to numeric comparison with trend awareness
      let cumple: boolean = false;
      if (typeof curr.compliant === 'boolean') {
        cumple = curr.compliant;
      } else {
        const calc = safeNumber(curr.calculatedValue ?? curr.calculated_value ?? curr.value ?? NaN, NaN);
        const targ = safeNumber(curr.target ?? (curr.indicator && curr.indicator.target) ?? NaN, NaN);
        const trend = String(curr.trend ?? (curr.indicator && curr.indicator.trend) ?? '').toLowerCase();
        if (!isNaN(calc) && !isNaN(targ)) {
          if (trend === 'decreasing') cumple = calc <= targ;
          else cumple = calc >= targ;
        } else {
          cumple = false; // unknown
        }
      }

      if (!acc[sede]) acc[sede] = { cumplidos: 0, noCumplidos: 0, details: [] };

      if (cumple) acc[sede].cumplidos += 1;
      else acc[sede].noCumplidos += 1;

      acc[sede].details.push({ ...curr, cumple });

      return acc;
    },
    {}
  );

  // Crear datos para el gráfico
  const chartData = Object.entries(grouped).flatMap(([sede, val]) => [
    { name: `${sede} (Cumple)`, value: val.cumplidos, sede, cumplimiento: true, details: val.details.filter(d => d.cumple) },
    { name: `${sede} (No cumple)`, value: val.noCumplidos, sede, cumplimiento: false, details: val.details.filter(d => !d.cumple) },
  ]);

  // Custom Tooltip
  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length > 0) {
      const { name, value, sede, cumplimiento } = payload[0].payload;
      const statusText = cumplimiento ? 'Cumple ✓' : 'No Cumple ✗';
      return (
        <div
          className="p-3 rounded border border-gray-300 text-sm"
          style={{
            backgroundColor: chartColors.tooltipBg,
            borderColor: isDarkMode ? '#4b5563' : '#ddd',
            color: chartColors.tooltipText,
          }}
        >
          <p className="font-semibold">{sede}</p>
          <p>{statusText}: <span className="font-bold">{value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Cumplimiento por sede
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={{
              fill: chartColors.axisText,
              fontSize: 12,
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.name.includes("No") ? COLORS[1] : COLORS[0]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDarkMode ? '#4b5563' : '#ddd',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#ddd'}`,
            }}
            formatter={(value) => {
              if (value.includes('Cumple)') && !value.includes('No')) {
                return <span style={{ color: '#10b981' }}>✓ Cumple</span>;
              }
              return <span style={{ color: '#ef4444' }}>✗ No Cumple</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
