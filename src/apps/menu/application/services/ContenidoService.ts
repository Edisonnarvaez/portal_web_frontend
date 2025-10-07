import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { ContenidoInformativo, TipoContenido } from "../../domain/types";

export class ContenidoService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async getAllContenidos(): Promise<ContenidoInformativo[]> {
    try {
      const contenidos = await this.repository.getContenidos();
      return this.sortByDate(contenidos);
    } catch (error) {
      console.error('Error getting contenidos:', error);
      throw new Error('No se pudieron cargar los contenidos');
    }
  }

  async getContenidosByTipo(tipo: 'noticia' | 'comunicado'): Promise<ContenidoInformativo[]> {
    try {
      const contenidos = await this.repository.getContenidosByTipo(tipo);
      return this.sortByDate(contenidos);
    } catch (error) {
      console.error('Error getting contenidos by tipo:', error);
      throw new Error(`No se pudieron cargar las ${tipo}s`);
    }
  }

  async getContenidosUrgentes(): Promise<ContenidoInformativo[]> {
    try {
      const contenidos = await this.repository.getContenidosUrgentes();
      return this.sortByDate(contenidos);
    } catch (error) {
      console.error('Error getting contenidos urgentes:', error);
      throw new Error('No se pudieron cargar los contenidos urgentes');
    }
  }

  async getContenidoById(id: number): Promise<ContenidoInformativo> {
    try {
      return await this.repository.getContenido(id);
    } catch (error) {
      console.error('Error getting contenido:', error);
      throw new Error('No se pudo cargar el contenido');
    }
  }

  filterContenidos(
    contenidos: ContenidoInformativo[], 
    searchTerm: string, 
    tipo: TipoContenido, 
    urgentOnly: boolean
  ): ContenidoInformativo[] {
    return contenidos.filter(contenido => {
      const matchesSearch = contenido.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contenido.contenido.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = tipo === 'todos' || contenido.tipo === tipo;
      const matchesUrgent = !urgentOnly || contenido.urgente;
      
      return matchesSearch && matchesTipo && matchesUrgent;
    });
  }

  private sortByDate(contenidos: ContenidoInformativo[]): ContenidoInformativo[] {
    return contenidos.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }
}