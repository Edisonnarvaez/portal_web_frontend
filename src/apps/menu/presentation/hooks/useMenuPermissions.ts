import { useMemo } from 'react';
import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { MenuPermissionService } from '../../application/services/MenuPermissionService';

export const useMenuPermissions = (appName: string = "menu") => {
  const { roles } = useAuthContext();

  return useMemo(() => {
    const normalizedRoles = roles.map(role =>
      typeof role === 'string' ? { name: role } : role
    );
    return MenuPermissionService.getPermissions(normalizedRoles, appName);
  }, [roles, appName]);
};