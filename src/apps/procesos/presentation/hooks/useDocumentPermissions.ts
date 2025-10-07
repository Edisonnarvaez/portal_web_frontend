import { useMemo } from 'react';
import { useAuthContext } from '../../../auth/presentation/context/AuthContext';
import { PermissionService } from '../../application/services/PermissionService';

export const useDocumentPermissions = (appName: string = "procesos") => {
    const { roles } = useAuthContext();

    return useMemo(() => {
        const normalizedRoles = roles.map(role =>
            typeof role === 'string' ? { name: role } : role
        );
        return PermissionService.getPermissions(normalizedRoles, appName);
    }, [roles, appName]);
};
