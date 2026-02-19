// src/apps/habilitacion/presentation/pages/AlertasHabilitacionPage.tsx
import { HiArrowLeft, HiBellAlert } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import AlertasHabilitacionPanel from '../components/AlertasHabilitacionPanel';

export default function AlertasHabilitacionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/habilitacion')}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <HiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HiBellAlert className="w-6 h-6 text-amber-500" />
            Centro de Alertas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Habilitaciones próximas a vencer, mejoras pendientes, hallazgos críticos y evaluaciones pendientes
          </p>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <AlertasHabilitacionPanel maxAlerts={50} dismissible />
      </div>
    </div>
  );
}
