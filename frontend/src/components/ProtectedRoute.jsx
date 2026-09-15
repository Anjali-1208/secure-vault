import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any page that requires login. If a list of `roles` is passed and
// the current user's role isn't in it, they're bounced to the dashboard -
// this is RBAC enforced on the frontend too (the backend enforces it for
// real; this is just to avoid showing UI the user can't actually use).
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}
