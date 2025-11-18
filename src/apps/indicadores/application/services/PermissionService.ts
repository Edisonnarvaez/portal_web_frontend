// ===================================
// 🔐 TIPOS E INTERFACES DE PERMISOS
// ===================================

export interface IndicadorPermissions {
  // Roles
  isAdmin: boolean;
  isGestor: boolean;
  isUser: boolean;

  // Permisos para IndicadoresPage (Gestión de Indicadores)
  indicadores: {
    canView: boolean;        // Ver indicadores
    canCreate: boolean;      // Crear indicadores
    canUpdate: boolean;      // Editar indicadores
    canDelete: boolean;      // Eliminar indicadores
  };

  // Permisos para ResultadosPage (Gestión de Resultados)
  resultados: {
    canView: boolean;        // Ver resultados
    canCreate: boolean;      // Crear resultados
    canUpdate: boolean;      // Editar resultados
    canDelete: boolean;      // Eliminar resultados
  };

  // Acceso general
  hasAccess: boolean;        // ¿Tiene acceso a la app?
}

// ===================================
// 🔐 SERVICIO DE PERMISOS
// ===================================

export class PermissionService {
  /**
   * Obtiene los permisos de un usuario basado en sus roles
   * 
   * Matriz de Permisos:
   * 
   * ADMIN:
   *   - IndicadoresPage: CRUD completo (Create, Read, Update, Delete)
   *   - ResultadosPage: CRUD completo (Create, Read, Update, Delete)
   * 
   * GESTOR:
   *   - IndicadoresPage: Solo lectura (Read only)
   *   - ResultadosPage: Create y Update (sin Delete)
   * 
   * USER:
   *   - IndicadoresPage: Sin acceso
   *   - ResultadosPage: Sin acceso
   */
  static getPermissions(
    roles: { name: string; app?: { name?: string } }[] = [],
    appName: string = 'indicadores'
  ): IndicadorPermissions {
    // Filtrar roles de la app actual (ignorando mayúsculas)
    const filteredRoles = roles.filter(
      r => r?.app?.name?.toLowerCase() === appName.toLowerCase()
    );

    const isAdmin = filteredRoles.some(r => r?.name?.toLowerCase() === 'admin');
    const isGestor = filteredRoles.some(r => r?.name?.toLowerCase() === 'gestor');
    const isUser = filteredRoles.some(r => r?.name?.toLowerCase() === 'user');

    // Verificar si el usuario tiene acceso a la aplicación
    const hasAccess = isAdmin || isGestor || isUser;

    return {
      isAdmin,
      isGestor,
      isUser,
      hasAccess,

      // ===== PERMISOS PARA IndicadoresPage =====
      indicadores: {
        // ADMIN: acceso completo
        // GESTOR: solo lectura
        // USER: sin acceso
        canView: isAdmin || isGestor,
        canCreate: isAdmin,
        canUpdate: isAdmin,
        canDelete: isAdmin,
      },

      // ===== PERMISOS PARA ResultadosPage =====
      resultados: {
        // ADMIN: acceso completo
        // GESTOR: crear y actualizar
        // USER: sin acceso
        canView: isAdmin || isGestor,
        canCreate: isAdmin || isGestor,
        canUpdate: isAdmin || isGestor,
        canDelete: isAdmin,
      },
    };
  }

  /**
   * Obtiene un mensaje de permiso denegado personalizado según el rol
   */
  static getPermissionMessage(
    role: 'admin' | 'gestor' | 'user',
    context: 'indicadores' | 'resultados'
  ): string {
    const messages = {
      admin: {
        indicadores: "Tienes acceso total a la gestión de indicadores",
        resultados: "Tienes acceso total a la gestión de resultados"
      },
      gestor: {
        indicadores: "No tienes permiso para crear, editar o eliminar indicadores. Solo puedes consultar.",
        resultados: "Puedes crear y actualizar resultados, pero no puedes eliminarlos."
      },
      user: {
        indicadores: "No tienes acceso a la gestión de indicadores.",
        resultados: "No tienes acceso a la gestión de resultados."
      }
    };

    return messages[role]?.[context] || "No tienes permiso para esta acción";
  }

  /**
   * Obtiene un mensaje descriptivo del rol del usuario
   */
  static getRoleDescription(role: 'admin' | 'gestor' | 'user'): string {
    const descriptions = {
      admin: "Administrador - Acceso completo",
      gestor: "Gestor - Acceso limitado",
      user: "Usuario - Acceso restringido"
    };
    return descriptions[role];
  }

  /**
   * Valida si el usuario puede realizar una acción específica
   */
  static canPerformAction(
    permissions: IndicadorPermissions,
    context: 'indicadores' | 'resultados',
    action: 'view' | 'create' | 'update' | 'delete'
  ): boolean {
    const contextPerms = permissions[context];

    switch (action) {
      case 'view':
        return contextPerms.canView;
      case 'create':
        return contextPerms.canCreate;
      case 'update':
        return contextPerms.canUpdate;
      case 'delete':
        return contextPerms.canDelete;
      default:
        return false;
    }
  }
}
