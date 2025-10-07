import type { Document } from '../../domain/entities/Document';
import type { Process } from '../../domain/entities/Process';
import type { ProcessType } from '../../domain/entities/ProcessType';
import { DocumentRepository } from '../../infrastructure/repositories/DocumentRepository';
import { ProcessRepository } from '../../infrastructure/repositories/ProcessRepository';
import { ProcessTypeRepository } from '../../infrastructure/repositories/ProcessTypeRepository';

export class DocumentService {
    private documentRepository: DocumentRepository;
    private processRepository?: ProcessRepository;
    private processTypeRepository?: ProcessTypeRepository;

    constructor(
        documentRepository: DocumentRepository,
        processRepository?: ProcessRepository,
        processTypeRepository?: ProcessTypeRepository
    ) {
        this.documentRepository = documentRepository;
        this.processRepository = processRepository;
        this.processTypeRepository = processTypeRepository;
    }

    async getDocuments(): Promise<Document[]> {
        return this.documentRepository.getAll();
    }

    async getProcesses(): Promise<Process[]> {
        if (!this.processRepository) {
            throw new Error('ProcessRepository not provided');
        }
        return this.processRepository.getAll();
    }

    async getProcessTypes(): Promise<ProcessType[]> {
        if (!this.processTypeRepository) {
            throw new Error('ProcessTypeRepository not provided');
        }
        return this.processTypeRepository.getAll();
    }

    async createDocument(data: FormData): Promise<Document> {
        return this.documentRepository.create(data);
    }

    async updateDocument(id: number, data: FormData): Promise<Document> {
        return this.documentRepository.update(id, data);
    }

    async deleteDocument(id: number): Promise<void> {
        return this.documentRepository.delete(id);
    }

    async downloadDocument(id: number, type: 'oficial' | 'editable'): Promise<Blob> {
        return this.documentRepository.download(id, type);
    }

    async previewDocument(id: number, type: 'oficial' | 'editable'): Promise<Blob> {
        return this.documentRepository.preview(id, type);
    }

    // Métodos auxiliares para la UI
    getProcessName(processes: Process[], processId: number): string {
        return processes.find(p => p.id === processId)?.name || 'N/A';
    }

    getProcessTypeName(processTypes: ProcessType[], processTypeId: number): string {
        return processTypes.find(pt => pt.id === processTypeId)?.name || 'N/A';
    }

    getDocumentPadreName(documents: Document[], documentoId: number | null): string {
        if (!documentoId) return 'N/A';
        const documento = documents.find(d => d.id === documentoId);
        return documento ? `${documento.codigo_documento} v${documento.version}` : 'N/A';
    }

    getDocumentosDisponiblesComoPadre(documents: Document[], currentDocument?: Document): Document[] {
        if (currentDocument) {
            // Excluir el documento actual y sus versiones relacionadas
            return documents.filter(doc =>
                doc.id !== currentDocument.id &&
                doc.codigo_documento !== currentDocument.codigo_documento
            );
        }
        return documents;
    }
}