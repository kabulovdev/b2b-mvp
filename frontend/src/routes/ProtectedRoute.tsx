import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import type { Role } from "../auth/types";

const ProtectedRoute: React.FC<{ role?: Role; children: React.ReactNode }> = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-300">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "buyer" ? "/buyer" : "/supplier"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
