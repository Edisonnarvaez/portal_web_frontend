import { HiOutlinePencil, HiOutlineCheckCircle, HiOutlineSquares2X2, HiOutlineDocumentDuplicate } from 'react-icons/hi2';
import { getEstadoColor, formatDate, diasParaVencimiento } from '../utils';

interface AutoevaluacionCardProps {
  id: number;
  numeroAutoevaluacion: string;
  periodo: number;
  estado: string;
  fechaVencimiento?: string;
  porcentajeCumplimiento?: number;
  datosPrestador?: {
    codigo_reps: string;
    nombre_prestador?: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onValidar?: (id: number) => void;
  onDuplicar?: (id: number) => void;
  onResumen?: (id: number) => void;
}

export const AutoevaluacionCard: React.FC<AutoevaluacionCardProps> = ({
  id,
  numeroAutoevaluacion,
  periodo,
  estado,
  fechaVencimiento,
  porcentajeCumplimiento,
  datosPrestador,
  onEdit,
  onDelete,
  onValidar,
  onDuplicar,
  onResumen,
}) => {
  const dias = diasParaVencimiento(fechaVencimiento);
  const vencidoClass = dias !== null && dias < 0 ? 'border-red-300 bg-red-50 dark:bg-red-950' : '';
  
  // Determinar si se pueden ejecutar acciones
  const puedeEditar = ['BORRADOR', 'EN_CURSO'].includes(estado);
  const puedeValidar = ['EN_CURSO', 'COMPLETADA', 'REVISADA'].includes(estado);
  const puedeDuplicar = estado === 'VALIDADA';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${vencidoClass}`}>
      {/* Header con estado */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{numeroAutoevaluacion}</h3>
            <span className="text-xs text-gray-600 dark:text-gray-400">Período {periodo}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {datosPrestador?.codigo_reps && `${datosPrestador.codigo_reps}${datosPrestador?.nombre_prestador ? ` - ${datosPrestador.nombre_prestador}` : ''}`}
          </p>
        </div>
        <div className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${getEstadoColor(estado)}`}>
          {estado}
        </div>
      </div>

      {/* Cumplimiento y vencimiento */}
      <div className="space-y-2 mb-3">
        {porcentajeCumplimiento !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Cumplimiento:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    porcentajeCumplimiento >= 80 ? 'bg-green-500' :
                    porcentajeCumplimiento >= 60 ? 'bg-yellow-500' :
                    porcentajeCumplimiento >= 40 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(porcentajeCumplimiento, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white w-10 text-right">
                {Math.round(porcentajeCumplimiento)}%
              </span>
            </div>
          </div>
        )}
        
        {fechaVencimiento && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Vencimiento:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatDate(fechaVencimiento)}</span>
          </div>
        )}
        
        {dias !== null && (
          <div className={`text-xs font-semibold ${dias < 0 ? 'text-red-600' : dias <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
            {dias < 0 ? `Vencida hace ${Math.abs(dias)} días` : `Vence en ${dias} días`}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 flex-wrap">
        {onResumen && (
          <button
            onClick={() => onResumen(id)}
            className="flex-1 min-w-fit px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-1"
            title="Ver resumen"
          >
            <HiOutlineSquares2X2 className="w-3 h-3" />
            Resumen
          </button>
        )}
        
        {onEdit && puedeEditar && (
          <button
            onClick={() => onEdit(id)}
            className="flex-1 min-w-fit px-2 py-1 text-xs bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors flex items-center justify-center gap-1"
            title="Editar"
          >
            <HiOutlinePencil className="w-3 h-3" />
            Editar
          </button>
        )}
        
        {onValidar && puedeValidar && (
          <button
            onClick={() => onValidar(id)}
            className="flex-1 min-w-fit px-2 py-1 text-xs bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-1"
            title="Validar"
          >
            <HiOutlineCheckCircle className="w-3 h-3" />
            Validar
          </button>
        )}
        
        {onDuplicar && puedeDuplicar && (
          <button
            onClick={() => onDuplicar(id)}
            className="flex-1 min-w-fit px-2 py-1 text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors flex items-center justify-center gap-1"
            title="Duplicar"
          >
            <HiOutlineDocumentDuplicate className="w-3 h-3" />
            Duplicar
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="flex-1 min-w-fit px-2 py-1 text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            title="Eliminar"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};
