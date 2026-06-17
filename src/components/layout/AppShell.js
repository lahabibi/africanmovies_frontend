import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";

function AppShell({ children }) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="app-shell">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      {children}
    </div>
  );
}

export default AppShell;
