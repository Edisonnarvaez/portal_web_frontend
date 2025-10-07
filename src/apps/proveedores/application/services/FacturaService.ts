import type { Factura } from "../../domain/entities/Factura";
import { FacturaRepository } from "../../infrastructure/repositories/FacturaRepository";
import { CentroOperacionesRepository } from "../../infrastructure/repositories/CentroOperacionesRepository";
import { EstadoFacturaRepository } from "../../infrastructure/repositories/EstadoFacturaRepository";
import { CausalDevolucionRepository } from "../../infrastructure/repositories/CausalDevolucionRepository";

export class FacturaService {
  private facturaRepo: FacturaRepository;
  private centroRepo?: CentroOperacionesRepository;
  private estadoRepo?: EstadoFacturaRepository;
  private causalRepo?: CausalDevolucionRepository;

  constructor(
    facturaRepo: FacturaRepository,
    centroRepo?: CentroOperacionesRepository,
    estadoRepo?: EstadoFacturaRepository,
    causalRepo?: CausalDevolucionRepository
  ) {
    this.facturaRepo = facturaRepo;
    this.centroRepo = centroRepo;
    this.estadoRepo = estadoRepo;
    this.causalRepo = causalRepo;
  }

  async getFacturas(): Promise<Factura[]> {
    return this.facturaRepo.getAll();
  }

  async updateFactura(id: number, data: any): Promise<Factura> {
    return this.facturaRepo.update(id, data);
  }

  // Carga de datos auxiliares
  async getCentrosOperaciones() {
    if (!this.centroRepo)
      throw new Error("CentroOperacionesRepository no provisto");
    return this.centroRepo.getAll();
  }

  async getEstadosFactura() {
    if (!this.estadoRepo)
      throw new Error("EstadoFacturaRepository no provisto");
    return this.estadoRepo.getAll();
  }

  async getCausalesDevolucion() {
    if (!this.causalRepo)
      throw new Error("CausalDevolucionRepository no provisto");
    return this.causalRepo.getAll();
  }

  // Métodos utilitarios (opcional)
  formatValor(valor: number): string {
    return `$${valor.toLocaleString()}`;
  }

  getEstadoLabel(estado: boolean): string {
    return estado ? "Activa" : "Inactiva";
  }
}
