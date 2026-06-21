import { createContext, useContext, useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";

const AppShellActionsContext = createContext(null);

function AppShell({ children }) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const logoutCancelRef = useRef(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isLogoutConfirmOpen) {
      return undefined;
    }

    logoutCancelRef.current?.focus();

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsLogoutConfirmOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLogoutConfirmOpen]);

  const handleLogout = () => {
    setIsLogoutConfirmOpen(false);
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate("/");
      },
    });
  };

  return (
    <AppShellActionsContext.Provider
      value={{ requestLogout: () => setIsLogoutConfirmOpen(true) }}
    >
      <div className="app-shell">
        <Header
          currentUser={currentUser}
          onLogoutRequest={() => setIsLogoutConfirmOpen(true)}
        />
        {children}

        {isLogoutConfirmOpen ? (
          <div
            className="logout-confirm"
            onClick={() => setIsLogoutConfirmOpen(false)}
            role="presentation"
          >
            <section
              aria-labelledby="logout-confirm-title"
              aria-modal="true"
              className="logout-confirm__dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <span className="logout-confirm__icon" aria-hidden="true">
                <LogOut size={23} strokeWidth={2} />
              </span>

              <div className="logout-confirm__copy">
                <h2 id="logout-confirm-title">Log out?</h2>
                <p>
                  You will need to request a new code before watching from this
                  device again.
                </p>
              </div>

              <div className="logout-confirm__actions">
                <button
                  className="logout-confirm__cancel"
                  disabled={logoutMutation.isPending}
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  ref={logoutCancelRef}
                  type="button"
                >
                  Stay Signed In
                </button>
                <button
                  className="logout-confirm__submit"
                  disabled={logoutMutation.isPending}
                  onClick={handleLogout}
                  type="button"
                >
                  {logoutMutation.isPending ? "Logging Out..." : "Log Out"}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AppShellActionsContext.Provider>
  );
}

export function useAppShellActions() {
  const actions = useContext(AppShellActionsContext);

  if (!actions) {
    throw new Error("useAppShellActions must be used within AppShell");
  }

  return actions;
}

export default AppShell;
