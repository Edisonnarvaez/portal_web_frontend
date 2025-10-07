export interface MenuPermissions {
  // Permisos generales
  isAdmin: boolean;
  canViewContent: boolean;
  
  // Permisos específicos por página
  canManageEventos: boolean;
  canManageFelicitaciones: boolean;
  canManageFuncionarios: boolean;
  canManageNoticias: boolean;
  canManageReconocimientos: boolean;
  
  // Permisos CRUD
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  
  // Información del usuario
  userRole: string;
  hasSpecificPageAccess: (page: 'eventos' | 'felicitaciones' | 'funcionarios' | 'noticias' | 'reconocimientos') => boolean;
}

export class MenuPermissionService {
  static getPermissions(
    roles: { name: string; app?: { name?: string } }[] = [],
    appName: string = 'menu'
  ): MenuPermissions {
    // Filtrar roles de la app actual (ignorando mayúsculas)
    const filteredRoles = roles.filter(
      r => r?.app?.name?.toLowerCase() === appName.toLowerCase()
    );

    // Determinar roles específicos
    const isAdmin = filteredRoles.some(r => r?.name === 'admin');
    const hasEventosRole = filteredRoles.some(r => r?.name === 'eventos');
    const hasFelicitacionesRole = filteredRoles.some(r => r?.name === 'felicitaciones');
    const hasFuncionariosRole = filteredRoles.some(r => r?.name === 'funcionarios');
    const hasNoticiasRole = filteredRoles.some(r => r?.name === 'noticias');
    const hasReconocimientosRole = filteredRoles.some(r => r?.name === 'reconocimientos');

    // Determinar el rol principal del usuario
    let userRole = 'viewer';
    if (isAdmin) userRole = 'admin';
    else if (hasEventosRole) userRole = 'eventos';
    else if (hasFelicitacionesRole) userRole = 'felicitaciones';
    else if (hasFuncionariosRole) userRole = 'funcionarios';
    else if (hasNoticiasRole) userRole = 'noticias';
    else if (hasReconocimientosRole) userRole = 'reconocimientos';

    return {
      // Permisos generales
      isAdmin,
      canViewContent: true, // Todos pueden ver contenido
      
      // Permisos específicos por página
      canManageEventos: isAdmin || hasEventosRole,
      canManageFelicitaciones: isAdmin || hasFelicitacionesRole,
      canManageFuncionarios: isAdmin || hasFuncionariosRole,
      canManageNoticias: isAdmin || hasNoticiasRole,
      canManageReconocimientos: isAdmin || hasReconocimientosRole,
      
      // Permisos CRUD (admin puede todo, otros según su rol específico)
      canCreate: isAdmin || hasEventosRole || hasFelicitacionesRole || hasFuncionariosRole || hasNoticiasRole || hasReconocimientosRole,
      canEdit: isAdmin || hasEventosRole || hasFelicitacionesRole || hasFuncionariosRole || hasNoticiasRole || hasReconocimientosRole,
      canDelete: isAdmin || hasEventosRole || hasFelicitacionesRole || hasFuncionariosRole || hasNoticiasRole || hasReconocimientosRole,
      
      // Información del usuario
      userRole,
      
      // Función helper para verificar acceso a página específica
      hasSpecificPageAccess: (page: 'eventos' | 'felicitaciones' | 'funcionarios' | 'noticias' | 'reconocimientos') => {
        if (isAdmin) return true;
        
        switch (page) {
          case 'eventos':
            return hasEventosRole;
          case 'felicitaciones':
            return hasFelicitacionesRole;
          case 'funcionarios':
            return hasFuncionariosRole;
          case 'noticias':
            return hasNoticiasRole;
          case 'reconocimientos':
            return hasReconocimientosRole;
          default:
            return false;
        }
      }
    };
  }

  static getPermissionMessage(
    role: string,
    action: 'create' | 'edit' | 'delete' | 'access'
  ): string {
    const messages = {
      viewer: {
        create: "No tienes permisos para crear contenido. Contacta al administrador.",
        edit: "No tienes permisos para editar contenido. Contacta al administrador.",
        delete: "No tienes permisos para eliminar contenido. Contacta al administrador.",
        access: "Solo puedes visualizar el contenido."
      },
      eventos: {
        create: "Solo puedes crear eventos.",
        edit: "Solo puedes editar eventos.",
        delete: "Solo puedes eliminar eventos.",
        access: "Tienes acceso completo a la gestión de eventos."
      },
      felicitaciones: {
        create: "Solo puedes crear felicitaciones.",
        edit: "Solo puedes editar felicitaciones.",
        delete: "Solo puedes eliminar felicitaciones.",
        access: "Tienes acceso completo a la gestión de felicitaciones."
      },
      funcionarios: {
        create: "Solo puedes crear funcionarios.",
        edit: "Solo puedes editar funcionarios.",
        delete: "Solo puedes eliminar funcionarios.",
        access: "Tienes acceso completo a la gestión de funcionarios."
      },
      noticias: {
        create: "Solo puedes crear noticias.",
        edit: "Solo puedes editar noticias.",
        delete: "Solo puedes eliminar noticias.",
        access: "Tienes acceso completo a la gestión de noticias."
      },
      reconocimientos: {
        create: "Solo puedes crear reconocimientos.",
        edit: "Solo puedes editar reconocimientos.",
        delete: "Solo puedes eliminar reconocimientos.",
        access: "Tienes acceso completo a la gestión de reconocimientos."
      },
      admin: {
        create: "Tienes acceso completo para crear cualquier contenido.",
        edit: "Tienes acceso completo para editar cualquier contenido.",
        delete: "Tienes acceso completo para eliminar cualquier contenido.",
        access: "Tienes acceso total al sistema."
      }
    };

    return messages[role as keyof typeof messages]?.[action] || "Permisos no definidos.";
  }
}
