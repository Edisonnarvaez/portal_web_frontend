import type { Document } from '../../domain/entities/Document';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileState {
  archivo_oficial: File | null;
  archivo_editable: File | null;
}

export class DocumentValidation {
  static validateDocument(
    form: Partial<Document>, 
    files: FileState, 
    isEdit: boolean
  ): ValidationResult {
    const errors: string[] = [];

    // Validar campos obligatorios
    if (!form.codigo_documento?.trim()) {
      errors.push("Código del documento es requerido");
    }
    
    if (!form.nombre_documento?.trim()) {
      errors.push("Nombre del documento es requerido");
    }
    
    if (!form.proceso) {
      errors.push("Proceso es requerido");
    }
    
    if (!form.tipo_documento) {
      errors.push("Tipo de documento es requerido");
    }

    // Validar archivos
    if (!isEdit && !files.archivo_oficial) {
      errors.push("Archivo oficial es requerido");
    }

    // Validar formatos de archivo
    if (files.archivo_oficial) {
      const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
      const fileExtension = files.archivo_oficial.name.toLowerCase().split('.').pop();
      
      if (!allowedFormats.includes(fileExtension || '')) {
        errors.push("Formato de archivo oficial no válido. Formatos permitidos: PDF, Word, Excel");
      }
    }

    if (files.archivo_editable) {
      const allowedFormats = ['doc', 'docx', 'xls', 'xlsx'];
      const fileExtension = files.archivo_editable.name.toLowerCase().split('.').pop();
      
      if (!allowedFormats.includes(fileExtension || '')) {
        errors.push("Formato de archivo editable no válido. Formatos permitidos: Word, Excel");
      }
    }

    // Validar versión
    if (form.version !== undefined && form.version < 0) {
      errors.push("La versión debe ser 0 o superior");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFileSize(file: File, maxSizeMB: number = 10): ValidationResult {
    const errors: string[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      errors.push(`El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}