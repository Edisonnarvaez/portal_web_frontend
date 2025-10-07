import { useMemo } from "react";
import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { FacturaPermissionService } from "../../application/services/FacturaPermissionService";

export const useFacturaPermissions = () => {
  const { roles } = useAuthContext();

  return useMemo(() => {
    return FacturaPermissionService.getPermissions(roles);
  }, [roles]);
};
