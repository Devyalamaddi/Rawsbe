import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ component }) {
  const token = localStorage.getItem("token");
  return token ? component : <Navigate to="/login" />;
}
