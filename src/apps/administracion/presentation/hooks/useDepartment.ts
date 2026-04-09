import { useState, useCallback } from 'react';
import { DepartmentService } from '../../application/services';
import type { Department, DepartmentCreate, DepartmentUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useDepartment Hook
 * Gestiona el estado y operaciones de departamentos
 */
export const useDepartment = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todos los departamentos
   */
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar departamentos');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener departamentos de una empresa
   */
  const fetchDepartmentsByCompany = useCallback(async (companyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepartmentService.getDepartmentsByCompany(companyId);
      setDepartments(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar departamentos');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener departamento por ID
   */
  const fetchDepartment = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepartmentService.getDepartment(id);
      setDepartment(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar departamento');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo departamento
   */
  const createDepartment = useCallback(async (data: DepartmentCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newDepartment = await DepartmentService.createDepartment(data);
      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear departamento');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar departamento
   */
  const updateDepartment = useCallback(async (id: number, data: DepartmentUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDepartment = await DepartmentService.updateDepartment(id, data);
      setDepartments(prev => prev.map(d => d.id === id ? updatedDepartment : d));
      if (department?.id === id) setDepartment(updatedDepartment);
      return updatedDepartment;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar departamento');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [department?.id]);

  /**
   * Eliminar departamento
   */
  const deleteDepartment = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await DepartmentService.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      if (department?.id === id) setDepartment(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar departamento');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [department?.id]);

  /**
   * Cambiar estado de departamento
   */
  const toggleStatus = useCallback(async (id: number, status: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await DepartmentService.toggleDepartmentStatus(id, status);
      setDepartments(prev => prev.map(d => d.id === id ? updated : d));
      if (department?.id === id) setDepartment(updated);
      return updated;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cambiar estado');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [department?.id]);

  /**
   * Validar datos de departamento
   */
  const validateData = useCallback((data: Partial<DepartmentCreate>) => {
    return DepartmentService.validateDepartmentData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    departments,
    department,
    loading,
    error,
    fetchDepartments,
    fetchDepartmentsByCompany,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleStatus,
    validateData,
    clearError,
  };
};
