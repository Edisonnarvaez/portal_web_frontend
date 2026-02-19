import { getEstadoColor, formatDate, diasParaVencimiento } from '../utils';

interface ServicioCardProps {
  id: number;
  codigoServicio: string;
  nombreServicio: string;
  modalidad: string;
  complejidad: string;
  estadoHabilitacion: string;
  fechaVencimiento?: string;
  headquarters?: {
    nombre: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ServicioCard: React.FC<ServicioCardProps> = ({
  id,
  codigoServicio,
  nombreServicio,
  modalidad,
  complejidad,
  estadoHabilitacion,
  fechaVencimiento,
  headquarters,
  onEdit,
  onDelete,
}) => {
  const dias = diasParaVencimiento(fechaVencimiento);
  const getComplejidadColor = (comp: string): string => {
    const colores: Record<string, string> = {
      'BAJA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ALTA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colores[comp] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{codigoServicio}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{nombreServicio}</p>
        </div>
        <div className="flex gap-2">
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

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
            {modalidad}
          </span>
          <span className={`px-2 py-1 rounded font-medium text-xs ${getComplejidadColor(complejidad)}`}>
            {complejidad}
          </span>
        </div>
        <div className={`inline-block px-2 py-1 rounded-full font-medium text-xs ${getEstadoColor(estadoHabilitacion)}`}>
          {estadoHabilitacion}
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

      {headquarters && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <strong>Sede:</strong> {headquarters.nombre}
        </div>
      )}
    </div>
  );
};
