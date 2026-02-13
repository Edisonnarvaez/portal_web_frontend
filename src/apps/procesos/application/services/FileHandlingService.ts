import * as XLSX from 'xlsx';
import { 
    FaFilePdf, 
    FaFileExcel, 
    FaFileWord, 
    FaFileAlt 
} from 'react-icons/fa';

export class FileHandlingService {
    static async processExcelFile(blob: Blob): Promise<{ data: { [key: string]: any[][] }, sheets: string[], merged: { [key: string]: string[] }, styles: any }> {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });
        const sheets: string[] = workbook.SheetNames;
        const data: { [key: string]: any[][] } = {};
        const merged: { [key: string]: string[] } = {};
        const styles: any = {};

        sheets.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            data[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Capturar celdas fusionadas
            if (worksheet['!merges']) {
                merged[sheetName] = worksheet['!merges'].map((merge: any) => 
                    `${XLSX.utils.encode_col(merge.s.c)}${merge.s.r}:${XLSX.utils.encode_col(merge.e.c)}${merge.e.r}`
                );
            } else {
                merged[sheetName] = [];
            }
            
            // Capturar estilos extendidos
            styles[sheetName] = {};
            for (let key in worksheet) {
                if (key[0] !== '!') {
                    const cell = worksheet[key];
                    if (cell.s) {
                        // Crear objeto de estilo mejorado
                        const cellStyleObj: any = {
                            fill: cell.s.fill || null,
                            font: cell.s.font || null,
                            alignment: cell.s.alignment || null,
                            border: cell.s.border || null,
                            numFmt: cell.s.numFmt || null
                        };
                        
                        // Sí hay información de fuente, aseguar que tenemos todos los detalles
                        if (cell.s.font) {
                            cellStyleObj.font = {
                                bold: cell.s.font.bold || false,
                                italic: cell.s.font.italic || false,
                                color: cell.s.font.color || null,
                                size: cell.s.font.sz || 11,
                                underline: cell.s.font.underline || false,
                                ...cell.s.font
                            };
                        }
                        
                        // Asegurar información de alineación
                        if (cell.s.alignment) {
                            cellStyleObj.alignment = {
                                horizontal: cell.s.alignment.horizontal || 'left',
                                vertical: cell.s.alignment.vertical || 'middle',
                                wrapText: cell.s.alignment.wrapText || false,
                                ...cell.s.alignment
                            };
                        }
                        
                        styles[sheetName][key] = cellStyleObj;
                    }
                }
            }
        });

        return { data, sheets, merged, styles };
    }

    static getFileIcon(filename: string): { Component: any, className: string } {
        const ext = filename?.toLowerCase().split('.').pop();
        
        switch (ext) {
            case 'pdf': 
                return { Component: FaFilePdf, className: 'text-red-500' };
            case 'xls':
            case 'xlsx': 
                return { Component: FaFileExcel, className: 'text-green-500' };
            case 'doc':
            case 'docx': 
                return { Component: FaFileWord, className: 'text-blue-500' };
            default: 
                return { Component: FaFileAlt, className: 'text-gray-500' };
        }
    }

    static getFileExtension(filename: string): string {
        return filename?.toLowerCase().split('.').pop() || '';
    }

    static async downloadFile(blob: Blob, filename: string): Promise<void> {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static isFileDownloadable(filename: string): boolean {
        const ext = this.getFileExtension(filename);
        return ['doc', 'docx', 'xls', 'xlsx', 'pdf'].includes(ext);
    }

    static getFileTypeCategory(filename: string): 'pdf' | 'excel' | 'word' | 'other' {
        const ext = this.getFileExtension(filename);
        
        if (ext === 'pdf') return 'pdf';
        if (['xls', 'xlsx'].includes(ext)) return 'excel';
        if (['doc', 'docx'].includes(ext)) return 'word';
        return 'other';
    }

    static isViewableFile(filename: string): boolean {
        const ext = this.getFileExtension(filename);
        return ['pdf', 'xls', 'xlsx', 'doc', 'docx'].includes(ext);
    }

    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}