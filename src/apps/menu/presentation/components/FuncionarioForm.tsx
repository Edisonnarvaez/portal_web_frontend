import React, { useState, useEffect } from "react";
import { HiUser, HiPhone, HiIdentification, HiCalendar } from "react-icons/hi2";
import { HiOfficeBuilding, HiMail } from "react-icons/hi";
import { FuncionarioService } from "../../application/services/FuncionarioService";
import type { Funcionario, Headquarters, CreateFuncionarioRequest, UpdateFuncionarioRequest } from "../../domain/types";
import { formatDateToInput, getCurrentLocalDate } from "../../../../shared/utils/dateUtils";

interface FuncionarioFormProps {
  funcionario?: Funcionario | null;
  onSubmit: (data: CreateFuncionarioRequest | UpdateFuncionarioRequest) => Promise<void>; // 👈 CAMBIAR: agregar Promise<void>
  loading?: boolean;
}

export default function FuncionarioForm({ funcionario, onSubmit, loading = false }: FuncionarioFormProps) {
  const [formData, setFormData] = useState({
    documento: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    cargo: '',
    sede: 0,
    telefono: '',
    correo: '',
    foto: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sedes, setSedes] = useState<Headquarters[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(true);

  const funcionarioService = new FuncionarioService();

  // Cargar sedes
  useEffect(() => {
    const fetchSedes = async () => {
      try {
        setLoadingSedes(true);
        const sedesData = await funcionarioService.getHeadquarters();
        setSedes(sedesData);
      } catch (error) {
        console.error('Error loading sedes:', error);
      } finally {
        setLoadingSedes(false);
      }
    };

    fetchSedes();
  }, []);

  // Llenar formulario cuando hay funcionario para editar
  useEffect(() => {
    if (funcionario) {
      setFormData({
        documento: funcionario.documento,
        nombres: funcionario.nombres,
        apellidos: funcionario.apellidos,
        fecha_nacimiento: formatDateToInput(funcionario.fecha_nacimiento), // 👈 USAR UTILIDAD
        cargo: funcionario.cargo,
        sede: funcionario.sede.id,
        telefono: funcionario.telefono,
        correo: funcionario.correo,
        foto: null
      });
    } else {
      setFormData({
        documento: '',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: getCurrentLocalDate(), // 👈 FECHA ACTUAL POR DEFECTO
        cargo: '',
        sede: 0,
        telefono: '',
        correo: '',
        foto: null
      });
    }
    setErrors({});
  }, [funcionario]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.documento.trim()) newErrors.documento = 'Documento es requerido';
    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos son requeridos';
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo es requerido';
    if (!formData.sede || formData.sede === 0) newErrors.sede = 'Sede es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono es requerido';
    if (!formData.correo.trim()) newErrors.correo = 'Correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Correo inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { // 👈 CAMBIAR: hacer async
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = funcionario 
      ? { id: funcionario.id, ...formData } as UpdateFuncionarioRequest
      : formData as CreateFuncionarioRequest;

    await onSubmit(submitData); // 👈 CAMBIAR: agregar await
  };

  const handleInputChange = (field: string, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form 
      id="crud-form" // 👈 NUEVO: ID para que el modal pueda encontrarlo
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiIdentification className="w-4 h-4 inline mr-2" />
            Documento
          </label>
          <input
            type="text"
            value={formData.documento}
            onChange={(e) => handleInputChange('documento', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.documento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
        </div>

        {/* Nombres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiUser className="w-4 h-4 inline mr-2" />
            Nombres
          </label>
          <input
            type="text"
            value={formData.nombres}
            onChange={(e) => handleInputChange('nombres', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.nombres ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
        </div>

        {/* Apellidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiUser className="w-4 h-4 inline mr-2" />
            Apellidos
          </label>
          <input
            type="text"
            value={formData.apellidos}
            onChange={(e) => handleInputChange('apellidos', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.apellidos ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiCalendar className="w-4 h-4 inline mr-2" />
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.fecha_nacimiento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.fecha_nacimiento && <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento}</p>}
        </div>

        {/* Cargo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiOfficeBuilding className="w-4 h-4 inline mr-2" />
            Cargo
          </label>
          <input
            type="text"
            value={formData.cargo}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.cargo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
        </div>

        {/* Sede */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiOfficeBuilding className="w-4 h-4 inline mr-2" />
            Sede
          </label>
          <select
            value={formData.sede}
            onChange={(e) => handleInputChange('sede', parseInt(e.target.value) || 0)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.sede ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading || loadingSedes}
          >
            <option value={0}>Seleccionar sede...</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.name} - {sede.city}
              </option>
            ))}
          </select>
          {errors.sede && <p className="text-red-500 text-sm mt-1">{errors.sede}</p>}
          {loadingSedes && <p className="text-gray-500 text-sm mt-1">Cargando sedes...</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiPhone className="w-4 h-4 inline mr-2" />
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiMail className="w-4 h-4 inline mr-2" />
            Correo electrónico
          </label>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => handleInputChange('correo', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              ${errors.correo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            disabled={loading}
          />
          {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
        </div>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Foto de perfil
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleInputChange('foto', e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={loading}
        />
      </div>
      
      {/* 👈 REMOVER: Ya no necesitamos botones aquí */}
    </form>
  );
}