import * as XLSX from "xlsx";
import { FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt } from "react-icons/fa";

export class FileHandlingService {
  static async processExcelFile(
    blob: Blob
  ): Promise<{ data: { [key: string]: any[][] }; sheets: string[] }> {
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheets: string[] = workbook.SheetNames;
    const data: { [key: string]: any[][] } = {};

    sheets.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      data[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    });

    return { data, sheets };
  }

  static getFileIcon(filename: string): { Component: any; className: string } {
    const ext = filename?.toLowerCase().split(".").pop();

    switch (ext) {
      case "pdf":
        return { Component: FaFilePdf, className: "text-red-500" };
      case "xls":
      case "xlsx":
        return { Component: FaFileExcel, className: "text-green-500" };
      case "doc":
      case "docx":
        return { Component: FaFileWord, className: "text-blue-500" };
      default:
        return { Component: FaFileAlt, className: "text-gray-500" };
    }
  }

  static getFileExtension(filename: string): string {
    return filename?.toLowerCase().split(".").pop() || "";
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static isFileDownloadable(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ["doc", "docx", "xls", "xlsx", "pdf"].includes(ext);
  }

  static getFileTypeCategory(
    filename: string
  ): "pdf" | "excel" | "word" | "other" {
    const ext = this.getFileExtension(filename);

    if (ext === "pdf") return "pdf";
    if (["xls", "xlsx"].includes(ext)) return "excel";
    if (["doc", "docx"].includes(ext)) return "word";
    return "other";
  }

  static isViewableFile(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ["pdf", "xls", "xlsx", "doc", "docx"].includes(ext);
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
