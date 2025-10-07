import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard = ({
  isAuthenticated,
  children,
  redirectTo = "/auth/login",
}: AuthGuardProps) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};