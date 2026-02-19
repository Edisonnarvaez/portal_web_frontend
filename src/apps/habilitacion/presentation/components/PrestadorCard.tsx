import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';
import { getEstadoColor, formatDate, diasParaVencimiento } from '../utils';

interface PrestadorCardProps {
  id: number;
  codigoReps: string;
  clasePresta: string;
  estadoHabilitacion: string;
  fechaVencimiento?: string;
  aseguradora?: string;
  numeroPolicza?: string;
  company?: {
    nombre: string;
  };
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

export const PrestadorCard: React.FC<PrestadorCardProps> = ({
  id,
  codigoReps,
  clasePresta,
  estadoHabilitacion,
  fechaVencimiento,
  aseguradora,
  numeroPolicza,
  company,
  onEdit,
  onView,
}) => {
  const dias = diasParaVencimiento(fechaVencimiento);
  const vencidoClass = dias !== null && dias < 0 ? 'border-red-300 bg-red-50 dark:bg-red-950' : '';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow ${vencidoClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{codigoReps}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{company?.nombre || 'N/A'}</p>
        </div>
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={() => onView(id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Ver"
            >
              <HiOutlineEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
              title="Editar"
            >
              <HiOutlinePencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Clase:</span>
          <span className="font-medium text-gray-900 dark:text-white">{clasePresta}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full font-medium text-xs ${getEstadoColor(estadoHabilitacion)}`}>
            {estadoHabilitacion}
          </span>
        </div>
      </div>

      {fechaVencimiento && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            <strong>Vencimiento:</strong> {formatDate(fechaVencimiento)}
          </div>
          {dias !== null && (
            <div className={`text-xs font-semibold ${dias < 0 ? 'text-red-600' : dias <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `Vence en ${dias} días`}
            </div>
          )}
        </div>
      )}

      {aseguradora && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <div><strong>Aseguradora:</strong> {aseguradora}</div>
          {numeroPolicza && <div><strong>Póliza:</strong> {numeroPolicza}</div>}
        </div>
      )}
    </div>
  );
};
