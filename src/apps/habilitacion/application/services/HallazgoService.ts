import type { Hallazgo, HallazgoCreate, HallazgoUpdate, EstadisticasHallazgos } from '../../domain/entities';
import { HallazgoRepository } from '../../infrastructure/repositories';

export class HallazgoService {
  private repository: HallazgoRepository;

  constructor(repository?: HallazgoRepository) {
    this.repository = repository || new HallazgoRepository();
  }

  async getHallazgos(filters?: Record<string, any>): Promise<Hallazgo[]> {
    return this.repository.getAll(filters);
  }

  async getHallazgo(id: number): Promise<Hallazgo> {
    return this.repository.getById(id);
  }

  async getHallazgosPorAutoevaluacion(autoevaluacionId: number): Promise<Hallazgo[]> {
    return this.repository.getByAutoevaluacion(autoevaluacionId);
  }

  async createHallazgo(data: HallazgoCreate): Promise<Hallazgo> {
    return this.repository.create(data);
  }

  async updateHallazgo(id: number, data: HallazgoUpdate): Promise<Hallazgo> {
    return this.repository.update(id, data);
  }

  async deleteHallazgo(id: number): Promise<void> {
    return this.repository.delete(id);
  }

  async getEstadisticas(autoevaluacionId: number): Promise<EstadisticasHallazgos> {
    return this.repository.getEstadisticas(autoevaluacionId);
  }

  async getAbiertos(): Promise<Hallazgo[]> {
    return this.repository.getAbiertos();
  }

  async getCriticos(): Promise<Hallazgo[]> {
    return this.repository.getCriticos();
  }

  getSeveridadColor(severidad: string): string {
    const coloresMap: Record<string, string> = {
      'BAJA': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'MEDIA': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ALTA': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'CRÍTICA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return coloresMap[severidad] || 'bg-gray-100 text-gray-800';
  }

  getTipoColor(tipo: string): string {
    const coloresMap: Record<string, string> = {
      'FORTALEZA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'OPORTUNIDAD_MEJORA': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'NO_CONFORMIDAD': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'HALLAZGO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return coloresMap[tipo] || 'bg-gray-100 text-gray-800';
  }
}
