import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { Evento } from "../../domain/types";
import { getDaysUntilDate } from "../../../../shared/utils/dateUtils";

export class EventoService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async getAllEventos(): Promise<Evento[]> {
    try {
      return await this.repository.getEventos();
    } catch (error) {
      console.error('Error getting eventos:', error);
      throw new Error('No se pudieron cargar los eventos');
    }
  }

  async getEventosProximos(): Promise<Evento[]> {
    try {
      const eventos = await this.repository.getEventosProximos();
      return this.sortByDate(eventos);
    } catch (error) {
      console.error('Error getting eventos proximos:', error);
      throw new Error('No se pudieron cargar los eventos próximos');
    }
  }

  async getEventosImportantes(): Promise<Evento[]> {
    try {
      return await this.repository.getEventosImportantes();
    } catch (error) {
      console.error('Error getting eventos importantes:', error);
      throw new Error('No se pudieron cargar los eventos importantes');
    }
  }

  async getEventosVirtuales(): Promise<Evento[]> {
    try {
      return await this.repository.getEventosVirtuales();
    } catch (error) {
      console.error('Error getting eventos virtuales:', error);
      throw new Error('No se pudieron cargar los eventos virtuales');
    }
  }

  async getEventoById(id: number): Promise<Evento> {
    try {
      return await this.repository.getEvento(id);
    } catch (error) {
      console.error('Error getting evento:', error);
      throw new Error('No se pudo cargar el evento');
    }
  }

  filterEventos(
    eventos: Evento[], 
    searchTerm: string, 
    virtualOnly: boolean, 
    importantOnly: boolean
  ): Evento[] {
    return eventos.filter(evento => {
      const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.detalles.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVirtual = !virtualOnly || evento.es_virtual;
      const matchesImportant = !importantOnly || evento.importante;
      
      return matchesSearch && matchesVirtual && matchesImportant;
    });
  }

  getDaysUntilEvent(fecha: string): number {
    return getDaysUntilDate(fecha);
  }

  private sortByDate(eventos: Evento[]): Evento[] {
    return eventos.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }
}