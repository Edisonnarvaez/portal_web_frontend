import { FileHandlingService } from '../../application/services/FileHandlingService';

export class FileUtils {
  static async createDownloadLink(blob: Blob, filename: string): Promise<void> {
    return FileHandlingService.downloadFile(blob, filename);
  }

  static createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  static getFileExtension(filename: string): string {
    return FileHandlingService.getFileExtension(filename);
  }

  static isViewableFile(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['pdf', 'xls', 'xlsx', 'xlsb', 'xlsm', 'doc', 'docx'].includes(ext);
  }

  static getFileTypeCategory(filename: string): 'pdf' | 'excel' | 'word' | 'other' {
    const ext = this.getFileExtension(filename);
    
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'xlsb', 'xlsm'].includes(ext)) return 'excel';
    if (['doc', 'docx'].includes(ext)) return 'word';
    return 'other';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}