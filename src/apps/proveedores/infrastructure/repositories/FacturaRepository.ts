import axiosInstance from "../../../../core/infrastructure/http/axiosInstance";
import type { Factura } from "../../domain/entities/Factura";

export class FacturaRepository {
  async getAll(): Promise<Factura[]> {
    const response = await axiosInstance.get("/gestionProveedores/factura/");
    return response.data;
  }

  async create(data: FormData): Promise<Factura> {
    const response = await axiosInstance.post(
      "/gestionProveedores/factura/",
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async update(id: number, data: any): Promise<Factura> {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }
    const response = await axiosInstance.patch(
      `/gestionProveedores/factura/${id}/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/gestionProveedores/factura/${id}/`);
  }

  async download(id: number): Promise<Blob> {
    const response = await axiosInstance.get(
      `/gestionProveedores/factura/${id}/download/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  async preview(id: number): Promise<Blob> {
    const response = await axiosInstance.get(
      `/gestionProveedores/factura/${id}/preview/`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}
