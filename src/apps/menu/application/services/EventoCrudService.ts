import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { 
  Evento, 
  CreateEventoRequest, 
  UpdateEventoRequest,
  CrudResponse 
} from "../../domain/types";

export class EventoCrudService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async createEvento(data: CreateEventoRequest): Promise<CrudResponse<Evento>> {
    try {
      const evento = await this.repository.createEvento(data);
      return {
        success: true,
        data: evento,
        message: 'Evento creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creating evento:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear evento'
      };
    }
  }

  async updateEvento(data: UpdateEventoRequest): Promise<CrudResponse<Evento>> {
    try {
      const evento = await this.repository.updateEvento(data);
      return {
        success: true,
        data: evento,
        message: 'Evento actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error updating evento:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar evento'
      };
    }
  }

  async deleteEvento(id: number): Promise<CrudResponse<void>> {
    try {
      await this.repository.deleteEvento(id);
      return {
        success: true,
        message: 'Evento eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error deleting evento:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar evento'
      };
    }
  }
}