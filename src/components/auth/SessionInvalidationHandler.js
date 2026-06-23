import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_SESSION_INVALIDATED_EVENT } from "../../api/authSession";

function SessionInvalidationHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleInvalidSession = (event) => {
      queryClient.clear();

      const isAuthPage = ["/signin", "/signup", "/otp"].includes(
        location.pathname,
      );
      const from = isAuthPage
        ? location.state?.from
        : `${location.pathname}${location.search}${location.hash}`;

      navigate("/signin", {
        replace: true,
        state: {
          from,
          sessionMessage: event.detail?.message,
        },
      });
    };

    window.addEventListener(
      AUTH_SESSION_INVALIDATED_EVENT,
      handleInvalidSession,
    );

    return () =>
      window.removeEventListener(
        AUTH_SESSION_INVALIDATED_EVENT,
        handleInvalidSession,
      );
  }, [location, navigate, queryClient]);

  return null;
}

export default SessionInvalidationHandler;
