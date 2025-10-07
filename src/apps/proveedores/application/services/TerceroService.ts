import type { Tercero, CreateTerceroRequest, UpdateTerceroRequest, Pais, Departamento, Municipio, TipoTercero } from '../../domain/entities/Tercero';
import { TerceroRepository } from '../../infrastructure/repositories/TerceroRepository';

export class TerceroService {
  private repository: TerceroRepository;

  constructor() {
    this.repository = new TerceroRepository();
  }

  async getAllTerceros(): Promise<Tercero[]> {
    return await this.repository.getAll();
  }

  async getTerceroById(id: number): Promise<Tercero> {
    return await this.repository.getById(id);
  }

  async createTercero(tercero: CreateTerceroRequest): Promise<Tercero> {
    // Validaciones de negocio
    if (!tercero.tercero_codigo?.trim()) {
      throw new Error('El código del tercero es obligatorio');
    }

    if (!tercero.tercero_tipo_documento) {
      throw new Error('El tipo de documento es obligatorio');
    }

    // Si es persona natural, debe tener nombre completo
    if (tercero.tercero_tipo_documento === 'CC' || tercero.tercero_tipo_documento === 'TI' || tercero.tercero_tipo_documento === 'CE') {
      if (!tercero.tercero_nombre_completo?.trim()) {
        throw new Error('El nombre completo es obligatorio para personas naturales');
      }
    }

    // Si es persona jurídica, debe tener razón social
    if (tercero.tercero_tipo_documento === 'NIT' || tercero.tercero_tipo_documento === 'NI') {
      if (!tercero.tercero_razon_social?.trim()) {
        throw new Error('La razón social es obligatoria para personas jurídicas');
      }
    }

    return await this.repository.create(tercero);
  }

  async updateTercero(tercero: UpdateTerceroRequest): Promise<Tercero> {
    return await this.repository.update(tercero);
  }

  async deleteTercero(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getPaises(): Promise<Pais[]> {
    return await this.repository.getPaises();
  }

  async getDepartamentos(paisId?: number): Promise<Departamento[]> {
    return await this.repository.getDepartamentos(paisId);
  }

  async getMunicipios(departamentoId?: number): Promise<Municipio[]> {
    return await this.repository.getMunicipios(departamentoId);
  }

  async getTiposTercero(): Promise<TipoTercero[]> {
    return await this.repository.getTiposTercero();
  }

  // Métodos auxiliares para la UI
  getTipoDocumentoLabel(tipo: string): string {
    const tiposDoc = {
      'CC': 'Cédula de Ciudadanía',
      'TI': 'Tarjeta de Identidad',
      'CE': 'Cédula de Extranjería',
      'PA': 'Pasaporte',
      'RC': 'Registro Civil',
      'NIT': 'Número de Identificación Tributaria',
      'OTRO': 'Otro',
    };
    return tiposDoc[tipo as keyof typeof tiposDoc] || tipo;
  }

  getNombreCompleto(tercero: Tercero): string {
    return tercero.tercero_nombre_completo || tercero.tercero_razon_social || 'Sin nombre';
  }

  esPersonaNatural(tipoDocumento: string): boolean {
    return ['CC', 'TI', 'CE', 'PA', 'RC'].includes(tipoDocumento);
  }

  esPersonaJuridica(tipoDocumento: string): boolean {
    return ['NIT', 'OTRO'].includes(tipoDocumento);
  }
}