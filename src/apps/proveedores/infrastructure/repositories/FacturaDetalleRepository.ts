import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";

export class FacturaDetalleRepository {
  async getByFacturaId(facturaId: number) {
    const response = await axiosInstance.get(
      `/gestionProveedores/facturas_detalles/?factura=${facturaId}`
    );
    return response.data;
  }

  async update(id: number, data: any) {
    const response = await axiosInstance.put(
      `/gestionProveedores/facturas_detalles/${id}/`,
      data
    );
    return response.data;
  }

  async create(data: any) {
    const response = await axiosInstance.post(
      `/gestionProveedores/facturas_detalles/`,
      data
    );
    return response.data;
  }
}
