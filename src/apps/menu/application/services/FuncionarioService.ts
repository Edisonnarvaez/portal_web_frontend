import { MenuRepository } from "../../infrastructure/repositories/MenuRepository";
import type { Funcionario, Headquarters } from "../../domain/types";

export class FuncionarioService {
  private repository: MenuRepository;

  constructor() {
    this.repository = new MenuRepository();
  }

  async getAllFuncionarios(): Promise<Funcionario[]> {
    try {
      return await this.repository.getFuncionarios();
    } catch (error) {
      console.error('Error getting funcionarios:', error);
      throw new Error('No se pudieron cargar los funcionarios');
    }
  }

  async getFuncionarioById(id: number): Promise<Funcionario> {
    try {
      return await this.repository.getFuncionario(id);
    } catch (error) {
      console.error('Error getting funcionario:', error);
      throw new Error('No se pudo cargar el funcionario');
    }
  }

  async getFuncionariosBySede(sedeId: number): Promise<Funcionario[]> {
    try {
      return await this.repository.getFuncionariosBySede(sedeId);
    } catch (error) {
      console.error('Error getting funcionarios by sede:', error);
      throw new Error('No se pudieron cargar los funcionarios de la sede');
    }
  }

  async getFuncionariosByCargo(cargo: string): Promise<Funcionario[]> {
    try {
      return await this.repository.getFuncionariosByCargo(cargo);
    } catch (error) {
      console.error('Error getting funcionarios by cargo:', error);
      throw new Error('No se pudieron cargar los funcionarios del cargo');
    }
  }

  async getHeadquarters(): Promise<Headquarters[]> {
    try {
      return await this.repository.getHeadquarters();
    } catch (error) {
      console.error('Error getting headquarters:', error);
      throw new Error('No se pudieron cargar las sedes');
    }
  }

  searchFuncionarios(funcionarios: Funcionario[], searchTerm: string): Funcionario[] {
    const term = searchTerm.toLowerCase();
    return funcionarios.filter(funcionario =>
      funcionario.nombres.toLowerCase().includes(term) ||
      funcionario.apellidos.toLowerCase().includes(term) ||
      funcionario.cargo.toLowerCase().includes(term) ||
      funcionario.correo.toLowerCase().includes(term) ||
      funcionario.sede.name.toLowerCase().includes(term) || // 👈 CAMBIAR: usar sede.name
      funcionario.sede.city.toLowerCase().includes(term)    // 👈 AGREGAR: buscar por ciudad
    );
  }

  getUniqueValues<K extends keyof Funcionario>(funcionarios: Funcionario[], key: K): string[] {
    if (key === 'sede') {
      // Para sede, extraer los nombres únicos
      return Array.from(new Set(
        funcionarios.map(f => f.sede.name) // 👈 CAMBIAR: usar sede.name
      )).sort();
    }
    return Array.from(new Set(funcionarios.map(f => f[key] as string))).sort();
  }

  // Actualizar método para obtener sedes únicas
  getUniqueSedes(funcionarios: Funcionario[]): Headquarters[] {
    const sedesMap = new Map<number, Headquarters>();
    funcionarios.forEach(funcionario => {
      sedesMap.set(funcionario.sede.id, funcionario.sede); // 👈 CAMBIAR: usar sede directamente
    });
    return Array.from(sedesMap.values()).sort((a, b) => a.name.localeCompare(b.name)); // 👈 CAMBIAR: usar name
  }
}