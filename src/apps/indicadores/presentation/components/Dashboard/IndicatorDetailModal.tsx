import React from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  indicator: any | null;
  results: any[]; // <- nuevo
}
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from "recharts";

export default function IndicatorDetailModal({ isOpen, onClose, indicator, results }: Props) {
  if (!indicator) return null;

const resultsForThisIndicator = results.filter(
  (r) => r.indicator === indicator.id
);

const chartData = resultsForThisIndicator
  .map((item) => ({
    resultado: item.calculatedValue,
    meta: parseFloat(indicator.target),
    periodo: (() => {
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
    })(),
  }))
  .sort((a, b) => a.periodo.localeCompare(b.periodo));

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
        {resultsForThisIndicator.length > 0 && (
  <div className="mt-6">
    <h3 className="text-md font-semibold mb-2">Evolución temporal</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <XAxis dataKey="periodo" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="resultado"
          stroke="#3b82f6"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="meta"
          stroke="#10b981"
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
              Detalle del Indicador
            </Dialog.Title>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-white" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <p><strong>Nombre:</strong> {indicator.name}</p>
            <p><strong>Código:</strong> {indicator.code}</p>
            <p><strong>Versión:</strong> {indicator.version}</p>
            <p><strong>Descripción:</strong> {indicator.description}</p>
            <hr />
            <p><strong>Fórmula:</strong> {indicator.numerator} / {indicator.denominator}</p>
            <p><strong>Unidad:</strong> {indicator.measurementUnit}</p>
            <p><strong>Frecuencia:</strong> {indicator.measurementFrequency}</p>
            <p><strong>Método de cálculo:</strong> {indicator.calculationMethod}</p>
            <p><strong>Meta:</strong> {indicator.target}</p>
            <hr />
            <p><strong>Responsable Numerador:</strong> {indicator.numeratorResponsible}</p>
            <p><strong>Responsable Denominador:</strong> {indicator.denominatorResponsible}</p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
