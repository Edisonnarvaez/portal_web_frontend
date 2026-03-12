import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';
import { getEstadoColor, formatDate, diasParaVencimiento } from '../utils';

interface PrestadorCardProps {
  id: number;
  codigoReps: string;
  nombrePrestador?: string;
  sedePrincipal?: boolean;
  clasePresta: string;
  estadoHabilitacion: string;
  fechaVencimiento?: string;
  aseguradora?: string;
  numeroPolicza?: string; // @deprecated use numeroPoliza
  numeroPoliza?: string;
  companyName?: string;
  headquarters_detail?: {
    id: number;
    name: string;
    habilitationCode?: string;
  };
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

export const PrestadorCard: React.FC<PrestadorCardProps> = ({
  id,
  codigoReps,
  nombrePrestador,
  sedePrincipal,
  clasePresta,
  estadoHabilitacion,
  fechaVencimiento,
  aseguradora,
  numeroPolicza,
  numeroPoliza: numeroPolizaProp,
  headquarters_detail,
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
          {nombrePrestador && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{nombrePrestador}</p>
          )}
          {headquarters_detail && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">{headquarters_detail.name}</p>
          )}
          {sedePrincipal && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Sede Principal
            </span>
          )}
          
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
          <span className="text-gray-600 dark:text-gray-400">Sede:</span>
          <span className="font-medium text-gray-900 dark:text-white">{headquarters_detail?.name || 'N/A'}</span>
        </div>
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
          {(numeroPolizaProp || numeroPolicza) && <div><strong>Póliza:</strong> {numeroPolizaProp || numeroPolicza}</div>}
        </div>
      )}
    </div>
  );
};
