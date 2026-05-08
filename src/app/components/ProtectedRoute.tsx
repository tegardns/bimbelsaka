import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/loginadmin" replace />;
  }

  return <>{children}</>;
}
