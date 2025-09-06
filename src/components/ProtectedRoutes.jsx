import { Navigate } from "react-router";
import { useAuth } from "../Context/authContext";
import { Loading } from "./Loading";

const ProtectedRoutes = ({ children }) => {
  const { isLoading, isLoggedIn, profile: user } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Allow access only for specific roles
  const allowedRoles = ["super_admin", "admin", "receptionist"];
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoutes;
