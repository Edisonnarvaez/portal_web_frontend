import { getEstadoColor, formatDate } from '../utils';

interface AutoevaluacionCardProps {
  id: number;
  numeroAutoevaluacion: string;
  periodo: number;
  estado: string;
  fechaVencimiento?: string;
  datosPrestador?: {
    codigo_reps: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onValidar?: (id: number) => void;
}

export const AutoevaluacionCard: React.FC<AutoevaluacionCardProps> = ({
  id,
  numeroAutoevaluacion,
  periodo,
  estado,
  fechaVencimiento,
  datosPrestador,
  onEdit,
  onDelete,
  onValidar,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{numeroAutoevaluacion}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Período: {periodo} {datosPrestador?.codigo_reps && `| ${datosPrestador.codigo_reps}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {onValidar && estado !== 'VALIDADA' && (
            <button
              onClick={() => onValidar(id)}
              className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              Validar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${getEstadoColor(estado)}`}>
          {estado}
        </div>
        {fechaVencimiento && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Vencimiento:</strong> {formatDate(fechaVencimiento)}
          </div>
        )}
      </div>
    </div>
  );
};
