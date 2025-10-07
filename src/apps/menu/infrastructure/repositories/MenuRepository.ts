import { MenuApiService } from "../services/MenuApiService";
import type { 
  Funcionario, 
  Headquarters,
  ContenidoInformativo, 
  Evento, 
  FelicitacionCumpleanios, 
  Reconocimiento,
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
  CreateContenidoRequest,
  UpdateContenidoRequest,
  CreateEventoRequest,
  UpdateEventoRequest,
  CreateReconocimientoRequest,
  UpdateReconocimientoRequest,
  CreateFelicitacionRequest,
  UpdateFelicitacionRequest
} from "../../domain/types";

export class MenuRepository {
  // ================ SEDES ================
  async getHeadquarters(): Promise<Headquarters[]> {
    return MenuApiService.getHeadquarters();
  }

  async getHeadquarter(id: number): Promise<Headquarters> {
    return MenuApiService.getHeadquarter(id);
  }

  // ================ FUNCIONARIOS (ACTUALIZADOS) ================
  async getFuncionarios(): Promise<Funcionario[]> {
    return MenuApiService.getFuncionarios();
  }

  async getFuncionario(id: number): Promise<Funcionario> {
    return MenuApiService.getFuncionario(id);
  }

  async getFuncionariosBySede(sedeId: number): Promise<Funcionario[]> {
    return MenuApiService.getFuncionariosBySede(sedeId);
  }

  async getFuncionariosByCargo(cargo: string): Promise<Funcionario[]> {
    return MenuApiService.getFuncionariosByCargo(cargo);
  }


  // ================ CRUD FUNCIONARIOS (ACTUALIZADOS) ================
  async createFuncionario(data: CreateFuncionarioRequest): Promise<Funcionario> {
    return MenuApiService.createFuncionario(data);
  }

  async updateFuncionario(data: UpdateFuncionarioRequest): Promise<Funcionario> {
    return MenuApiService.updateFuncionario(data);
  }

  async deleteFuncionario(id: number): Promise<void> {
    return MenuApiService.deleteFuncionario(id);
  }

  // ================ CRUD CONTENIDOS ================
  async createContenido(data: CreateContenidoRequest): Promise<ContenidoInformativo> {
    return MenuApiService.createContenido(data);
  }

  async updateContenido(data: UpdateContenidoRequest): Promise<ContenidoInformativo> {
    return MenuApiService.updateContenido(data);
  }

  async deleteContenido(id: number): Promise<void> {
    return MenuApiService.deleteContenido(id);
  }

  // ================ CRUD EVENTOS ================
  async createEvento(data: CreateEventoRequest): Promise<Evento> {
    return MenuApiService.createEvento(data);
  }

  async updateEvento(data: UpdateEventoRequest): Promise<Evento> {
    return MenuApiService.updateEvento(data);
  }

  async deleteEvento(id: number): Promise<void> {
    return MenuApiService.deleteEvento(id);
  }

  // ================ CRUD RECONOCIMIENTOS ================
  async createReconocimiento(data: CreateReconocimientoRequest): Promise<Reconocimiento> {
    return MenuApiService.createReconocimiento(data);
  }

  async updateReconocimiento(data: UpdateReconocimientoRequest): Promise<Reconocimiento> {
    return MenuApiService.updateReconocimiento(data);
  }

  async deleteReconocimiento(id: number): Promise<void> {
    return MenuApiService.deleteReconocimiento(id);
  }

  // ================ CRUD FELICITACIONES ================
  async createFelicitacion(data: CreateFelicitacionRequest): Promise<FelicitacionCumpleanios> {
    return MenuApiService.createFelicitacion(data);
  }

  async updateFelicitacion(data: UpdateFelicitacionRequest): Promise<FelicitacionCumpleanios> {
    return MenuApiService.updateFelicitacion(data);
  }

  async deleteFelicitacion(id: number): Promise<void> {
    return MenuApiService.deleteFelicitacion(id);
  }

  // ================ CONSULTA CONTENIDOS INFORMATIVOS ================
  async getContenidos(): Promise<ContenidoInformativo[]> {
    return MenuApiService.getContenidos();
  }

  async getContenidosByTipo(tipo: 'noticia' | 'comunicado'): Promise<ContenidoInformativo[]> {
    return MenuApiService.getContenidosByTipo(tipo);
  }

  async getContenidosUrgentes(): Promise<ContenidoInformativo[]> {
    return MenuApiService.getContenidosUrgentes();
  }

  async getContenido(id: number): Promise<ContenidoInformativo> {
    return MenuApiService.getContenido(id);
  }

  // ================ CONSULTA EVENTOS ================
  async getEventos(): Promise<Evento[]> {
    return MenuApiService.getEventos();
  }

  async getEventosProximos(): Promise<Evento[]> {
    return MenuApiService.getEventosProximos();
  }

  async getEventosImportantes(): Promise<Evento[]> {
    return MenuApiService.getEventosImportantes();
  }

  async getEventosVirtuales(): Promise<Evento[]> {
    return MenuApiService.getEventosVirtuales();
  }

  async getEvento(id: number): Promise<Evento> {
    return MenuApiService.getEvento(id);
  }

  // ================ CONSULTA FELICITACIONES Y RECONOCIMIENTOS (ACTUALIZADO) ================
  async getFelicitacionesMes(): Promise<FelicitacionCumpleanios[]> {
    return MenuApiService.getFelicitacionesMes();
  }

  // 👈 AGREGAR: Para gestión completa
  async getAllFelicitaciones(): Promise<FelicitacionCumpleanios[]> {
    return MenuApiService.getAllFelicitaciones();
  }

  async getReconocimientosPublicados(): Promise<Reconocimiento[]> {
    return MenuApiService.getReconocimientosPublicados();
  }

  // 👈 AGREGAR: Para gestión completa
  async getAllReconocimientos(): Promise<Reconocimiento[]> {
    return MenuApiService.getAllReconocimientos();
  }
}