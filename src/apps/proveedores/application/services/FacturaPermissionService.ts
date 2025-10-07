export interface FacturaPermissions {
  isAdmin: boolean;
  isGestor: boolean;
  isUser: boolean;
  canViewFacturas: boolean;
  canDownload: boolean;
  canManage: boolean;
  canDownloadByFormat: (filename: string) => boolean;
}

export class FacturaPermissionService {
  static getPermissions(roles: string[]): FacturaPermissions {
    const isAdmin = roles.includes("admin");
    const isGestor = roles.includes("gestor");
    const isUser = roles.includes("user");

    return {
      isAdmin,
      isGestor,
      isUser,
      canViewFacturas: isAdmin || isGestor || isUser,
      canDownload: isAdmin || isGestor,
      canManage: isAdmin,
      canDownloadByFormat: (filename: string) => {
        const ext = filename?.toLowerCase().split(".").pop();

        if (["doc", "docx", "xls", "xlsx"].includes(ext || "")) {
          return true;
        }

        if (ext === "pdf") {
          return isAdmin || isGestor;
        }

        return false;
      },
    };
  }

  static getPermissionMessage(
    role: "admin" | "gestor" | "user",
    action: "emptyState"
  ): string {
    const messages = {
      admin: {
        emptyState: "Intenta ajustar los filtros de búsqueda",
      },
      gestor: {
        emptyState: "No hay facturas disponibles para consulta y descarga",
      },
      user: {
        emptyState: "No hay facturas disponibles para consulta",
      },
    };

    return messages[role][action];
  }
}
