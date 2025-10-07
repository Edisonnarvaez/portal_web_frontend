export interface DocumentPermissions {
  isAdmin: boolean;
  isGestor: boolean;
  isUser: boolean;
  canViewDocuments: boolean;
  canDownload: boolean;
  canManage: boolean;
  canDownloadByFormat: (filename: string) => boolean;
}

export class PermissionService {
  static getPermissions(
    roles: { name: string; app?: { name?: string } }[] = [],
    appName: string = 'procesos'  // valor por defecto opcional
  ): DocumentPermissions {
    // Filtrar roles de la app actual (ignorando mayúsculas)
    const filteredRoles = roles.filter(
      r => r?.app?.name?.toLowerCase() === appName.toLowerCase()
    );

    const isAdmin = filteredRoles.some(r => r?.name === 'admin');
    const isGestor = filteredRoles.some(r => r?.name === 'gestor');
    const isUser = filteredRoles.some(r => r?.name === 'user');

    return {
      isAdmin,
      isGestor,
      isUser,
      canViewDocuments: isAdmin || isGestor || isUser,
      canDownload: isAdmin || isGestor,
      canManage: isAdmin,
      canDownloadByFormat: (filename: string) => {
        const ext = filename?.toLowerCase().split('.').pop();

        if (['doc', 'docx', 'xls', 'xlsx'].includes(ext || '')) {
          return true;
        }

        if (ext === 'pdf') {
          return isAdmin || isGestor;
        }

        return false;
      }
    };
  }

  static getPermissionMessage(
    role: 'admin' | 'gestor' | 'user',
    action: 'emptyState'
  ): string {
    const messages = {
      admin: {
        emptyState: "Intenta ajustar los filtros de búsqueda"
      },
      gestor: {
        emptyState: "No hay documentos disponibles para consulta y descarga"
      },
      user: {
        emptyState: "No hay documentos disponibles para consulta"
      }
    };

    return messages[role]?.[action] || "No tienes permiso para esta acción";
  }
}
