import { useState } from 'react';
import { FileHandlingService } from '../../application/services/FileHandlingService';
import { DocumentService } from '../../application/services/DocumentService';
import { DocumentRepository } from '../../infrastructure/repositories/DocumentRepository';
import { ProcessRepository } from '../../infrastructure/repositories/ProcessRepository';
import type { Document } from '../../domain/entities/Document';

export const useFileHandling = () => {
    const [loading, setLoading] = useState(false);
    const documentService = new DocumentService(
        new DocumentRepository(),
        new ProcessRepository()
    );

    const handleDownload = async (
        document: Document,
        type: 'oficial' | 'editable',
        filename: string
    ) => {
        setLoading(true);
        try {
            const blob = await documentService.downloadDocument(document.id, type);
            await FileHandlingService.downloadFile(blob, filename);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (
        documentId: number,
        type: 'oficial' | 'editable'
    ): Promise<string> => {
        setLoading(true);
        try {
            const blob = await documentService.previewDocument(documentId, type);
            return URL.createObjectURL(blob);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const processExcelFile = FileHandlingService.processExcelFile;

    return {
        loading,
        handleDownload,
        handlePreview,
        processExcelFile
    };
};