import type { DocumentPermissions } from '../../application/services/PermissionService';

export class PermissionUtils {
  static canPerformAction(
    permissions: DocumentPermissions,
    action: 'view' | 'download' | 'manage' | 'edit' | 'delete'
  ): boolean {
    switch (action) {
      case 'view':
        return permissions.canViewDocuments;
      case 'download':
        return permissions.canDownload;
      case 'manage':
      case 'edit':
      case 'delete':
        return permissions.canManage;
      default:
        return false;
    }
  }

  static getPermissionMessage(
    permissions: DocumentPermissions,
    action: 'view' | 'download' | 'manage'
  ): string {
    const role = permissions.isAdmin ? 'admin' : 
      permissions.isGestor ? 'gestor' : 'user';
    
    const messages = {
      view: {
        user: "No tienes permisos para ver este documento",
        gestor: "No tienes permisos para ver este documento",
        admin: "No tienes permisos para ver este documento"
      },
      download: {
        user: "No tienes permisos para descargar. Contacta al gestor o administrador.",
        gestor: "No tienes permisos para descargar este tipo de archivo.",
        admin: "No tienes permisos para descargar este archivo."
      },
      manage: {
        user: "No tienes permisos para gestionar documentos. Contacta al administrador.",
        gestor: "No tienes permisos para gestionar documentos. Contacta al administrador.",
        admin: "No tienes permisos para gestionar este documento."
      }
    };

    return messages[action][role];
  }

  static shouldShowAction(
    permissions: DocumentPermissions,
    action: 'view' | 'download' | 'edit' | 'delete' | 'create',
    filename?: string
  ): boolean {
    switch (action) {
      case 'view':
        return permissions.canViewDocuments;
      case 'download':
        return filename ? permissions.canDownloadByFormat(filename) : permissions.canDownload;
      case 'edit':
      case 'delete':
      case 'create':
        return permissions.canManage;
      default:
        return false;
    }
  }
}