import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { API_CONNECTION_ERROR_EVENT } from "../api/connectivityEvents";
import { getBackendHealth } from "../api/healthApi";
import ConnectivityStatus from "../components/system/ConnectivityStatus";

const HEALTH_CHECK_INTERVAL = 45 * 1000;
const HEALTH_CHECK_TIMEOUT = 8 * 1000;
const RESTORED_MESSAGE_DURATION = 3500;

const ConnectivityContext = createContext(null);

function browserIsOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function ConnectivityProvider({ children }) {
  const queryClient = useQueryClient();
  const initialOnlineRef = useRef(browserIsOnline());
  const hadConnectionIssueRef = useRef(!initialOnlineRef.current);
  const inFlightRef = useRef(null);
  const healthAbortRef = useRef(null);
  const restoredTimerRef = useRef(null);
  const mountedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState(
    initialOnlineRef.current ? "checking" : "offline",
  );

  const showConnectionIssue = useCallback((nextStatus) => {
    window.clearTimeout(restoredTimerRef.current);
    hadConnectionIssueRef.current = true;
    setStatus(nextStatus);
  }, []);

  const showAvailable = useCallback(async () => {
    if (!hadConnectionIssueRef.current) {
      setStatus("available");
      return;
    }

    hadConnectionIssueRef.current = false;
    setStatus("restored");

    await queryClient.resumePausedMutations();
    await queryClient.invalidateQueries({ refetchType: "active" });

    window.clearTimeout(restoredTimerRef.current);
    restoredTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setStatus("available");
    }, RESTORED_MESSAGE_DURATION);
  }, [queryClient]);

  const checkConnection = useCallback(() => {
    if (!browserIsOnline()) {
      showConnectionIssue("offline");
      return Promise.resolve(false);
    }

    if (inFlightRef.current) return inFlightRef.current;

    setIsChecking(true);
    const controller = new AbortController();
    healthAbortRef.current = controller;
    let didTimeout = false;

    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, HEALTH_CHECK_TIMEOUT);

    const request = getBackendHealth({ signal: controller.signal })
      .then(async () => {
        if (mountedRef.current) await showAvailable();
        return true;
      })
      .catch((error) => {
        if (!mountedRef.current) return false;
        if (error?.name === "AbortError" && !didTimeout) return false;

        showConnectionIssue(browserIsOnline() ? "unavailable" : "offline");
        return false;
      })
      .finally(() => {
        window.clearTimeout(timeoutId);

        if (healthAbortRef.current !== controller) return;

        inFlightRef.current = null;
        healthAbortRef.current = null;
        if (mountedRef.current) setIsChecking(false);
      });

    inFlightRef.current = request;
    return request;
  }, [showAvailable, showConnectionIssue]);

  useEffect(() => {
    mountedRef.current = true;

    const handleOffline = () => {
      const activeController = healthAbortRef.current;
      healthAbortRef.current = null;
      inFlightRef.current = null;
      activeController?.abort();
      showConnectionIssue("offline");
    };
    const handleOnline = () => checkConnection();
    const handleApiConnectionError = () => checkConnection();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkConnection();
    };

    checkConnection();
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener(
      API_CONNECTION_ERROR_EVENT,
      handleApiConnectionError,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "hidden") checkConnection();
    }, HEALTH_CHECK_INTERVAL);

    return () => {
      mountedRef.current = false;
      const activeController = healthAbortRef.current;
      healthAbortRef.current = null;
      inFlightRef.current = null;
      activeController?.abort();
      window.clearInterval(intervalId);
      window.clearTimeout(restoredTimerRef.current);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener(
        API_CONNECTION_ERROR_EVENT,
        handleApiConnectionError,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkConnection, showConnectionIssue]);

  return (
    <ConnectivityContext.Provider
      value={{ checkConnection, isChecking, status }}
    >
      {children}
      <ConnectivityStatus
        isChecking={isChecking}
        onRetry={checkConnection}
        status={status}
      />
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);

  if (!context) {
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  }

  return context;
}

export default ConnectivityProvider;
