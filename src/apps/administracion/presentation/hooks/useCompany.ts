import { useState, useCallback } from 'react';
import { CompanyService } from '../../application/services';
import type { Company, CompanyCreate, CompanyUpdate } from '../../domain/entities';
import { extractErrorMessage } from '../../../../shared/utils/error';

/**
 * useCompany Hook
 * Gestiona el estado y operaciones de empresas
 */
export const useCompany = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener todas las empresas
   */
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CompanyService.getCompanies();
      setCompanies(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar empresas');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener empresa por ID
   */
  const fetchCompany = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await CompanyService.getCompany(id);
      setCompany(data);
      return data;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al cargar empresa');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva empresa
   */
  const createCompany = useCallback(async (data: CompanyCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newCompany = await CompanyService.createCompany(data);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al crear empresa');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar empresa
   */
  const updateCompany = useCallback(async (id: number, data: CompanyUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCompany = await CompanyService.updateCompany(id, data);
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      if (company?.id === id) setCompany(updatedCompany);
      return updatedCompany;
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al actualizar empresa');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  /**
   * Eliminar empresa
   */
  const deleteCompany = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await CompanyService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (company?.id === id) setCompany(null);
    } catch (err: unknown) {
      const errorMsg = extractErrorMessage(err, 'Error al eliminar empresa');
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  /**
   * Validar datos de empresa
   */
  const validateData = useCallback((data: Partial<CompanyCreate>) => {
    return CompanyService.validateCompanyData(data);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    companies,
    company,
    loading,
    error,
    fetchCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    validateData,
    clearError,
  };
};
