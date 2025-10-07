import axiosInstance from '../../../../core/infrastructure/http/axiosInstance';
import type { Document } from '../../domain/entities/Document';

export class DocumentRepository {
    async getAll(): Promise<Document[]> {
        const response = await axiosInstance.get("/processes/documentos/");
        return response.data;
    }

    async create(data: FormData): Promise<Document> {
        const response = await axiosInstance.post("/processes/documentos/", data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async update(id: number, data: FormData): Promise<Document> {
        const response = await axiosInstance.patch(`/processes/documentos/${id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`/processes/documentos/${id}/`);
    }

    async download(id: number, type: 'oficial' | 'editable'): Promise<Blob> {
        const response = await axiosInstance.get(
            `/processes/documentos/${id}/download/?tipo=${type}`,
            { responseType: 'blob' }
        );
        return response.data;
    }

    async preview(id: number, type: 'oficial' | 'editable'): Promise<Blob> {
        const response = await axiosInstance.get(
            `/processes/documentos/${id}/preview/?tipo=${type}`,
            { responseType: 'blob' }
        );
        return response.data;
    }
}