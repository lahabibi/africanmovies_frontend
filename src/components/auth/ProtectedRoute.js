import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../../api/authToken";

function ProtectedRoute() {
  const location = useLocation();

  if (!getAuthToken()) {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate replace state={{ from }} to="/signin" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
