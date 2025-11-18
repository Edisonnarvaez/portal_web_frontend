import { useAuth } from '../../../auth/presentation/hooks/useAuth';
import { PermissionService, type IndicadorPermissions } from '../../application/services/PermissionService';

/**
 * Hook personalizado para gestionar permisos en las páginas de Indicadores y Resultados
 * 
 * Uso:
 * const { permissions, canCreate, canEdit, canDelete } = usePermissions('indicadores');
 * 
 * if (!permissions.indicadores.canCreate) {
 *   return <div>No tienes permiso para crear indicadores</div>;
 * }
 */
export const usePermissions = (context: 'indicadores' | 'resultados' = 'indicadores') => {
  // Obtener el usuario del contexto de autenticación
  const { user } = useAuth();

  // Obtener los permisos del usuario
  const permissions: IndicadorPermissions = user?.roles 
    ? PermissionService.getPermissions(user.roles, 'indicadores')
    : {
        isAdmin: false,
        isGestor: false,
        isUser: false,
        hasAccess: false,
        indicadores: { canView: false, canCreate: false, canUpdate: false, canDelete: false },
        resultados: { canView: false, canCreate: false, canUpdate: false, canDelete: false },
      };

  // Funciones de conveniencia
  const canView = permissions[context].canView;
  const canCreate = permissions[context].canCreate;
  const canUpdate = permissions[context].canUpdate;
  const canDelete = permissions[context].canDelete;

  // Mensaje de permiso denegado
  const getRoleName = () => {
    if (permissions.isAdmin) return 'admin';
    if (permissions.isGestor) return 'gestor';
    if (permissions.isUser) return 'user';
    return 'sin rol';
  };

  const permissionMessage = PermissionService.getPermissionMessage(getRoleName() as 'admin' | 'gestor' | 'user', context);
  const roleDescription = PermissionService.getRoleDescription(getRoleName() as 'admin' | 'gestor' | 'user');

  return {
    // Permisos completos
    permissions,

    // Flags de contexto actual
    canView,
    canCreate,
    canUpdate,
    canDelete,

    // Información del usuario
    userRole: getRoleName(),
    isAdmin: permissions.isAdmin,
    isGestor: permissions.isGestor,
    isUser: permissions.isUser,
    hasAccess: permissions.hasAccess,

    // Mensajes
    permissionMessage,
    roleDescription,

    // Funciones auxiliares
    canPerform: (action: 'view' | 'create' | 'update' | 'delete') =>
      PermissionService.canPerformAction(permissions, context, action),
  };
};
