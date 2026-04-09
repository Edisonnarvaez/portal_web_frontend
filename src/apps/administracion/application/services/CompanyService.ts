/**
 * CompanyService
 * Servicio centralizado para la gestión de empresas
 * Centraliza toda la lógica de negocio y delega HTTP al repository
 */

import { CompanyRepository } from '../../infrastructure/repositories';
import type { Company, CompanyCreate, CompanyUpdate } from '../../domain/entities';

export class CompanyService {
  private static repository = new CompanyRepository();

  /**
   * Obtener todas las empresas
   */
  static async getCompanies(): Promise<Company[]> {
    return this.repository.getAllCompanies();
  }

  /**
   * Obtener una empresa por ID
   */
  static async getCompany(id: number): Promise<Company> {
    return this.repository.getCompany(id);
  }

  /**
   * Crear nueva empresa
   */
  static async createCompany(data: CompanyCreate): Promise<Company> {
    const validation = this.validateCompanyData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.createCompany(data);
  }

  /**
   * Actualizar empresa existente
   */
  static async updateCompany(id: number, data: CompanyUpdate): Promise<Company> {
    const validation = this.validateCompanyData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.repository.updateCompany(id, data);
  }

  /**
   * Eliminar empresa
   */
  static async deleteCompany(id: number): Promise<void> {
    return this.repository.deleteCompany(id);
  }

  /**
   * Validar datos de empresa
   */
  static validateCompanyData(data: Partial<CompanyCreate>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Campos requeridos
    if (!data.name) errors.push('El nombre de la empresa es requerido');
    if (!data.type_document) errors.push('El tipo de documento es requerido');
    if (!data.number_document) errors.push('El número de documento es requerido');
    if (!data.legal_nature) errors.push('La naturaleza legal es requerida');
    if (!data.class_healthcare_entity) errors.push('La clase de entidad de salud es requerida');
    if (!data.type_document_legal_representative) errors.push('El tipo de documento del representante es requerido');
    if (!data.number_document_legal_representative) errors.push('El número de documento del representante es requerido');
    if (!data.name_legal_representative) errors.push('El nombre del representante legal es requerido');
    if (!data.phone) errors.push('El teléfono es requerido');
    if (!data.address) errors.push('La dirección es requerida');
    if (!data.contactEmail) errors.push('El correo de contacto es requerido');
    
    // Validar documento (formato básico)
    if (data.number_document && !/^[0-9\-]{6,}$/.test(data.number_document)) {
      errors.push('El formato del documento no es válido');
    }

    // Validar email
    if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      errors.push('El correo electrónico no es válido');
    }

    // Validar teléfono (formato básico)
    if (data.phone && !/^[0-9\-\+\s\(\)]{7,}$/.test(data.phone)) {
      errors.push('El formato del teléfono no es válido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
