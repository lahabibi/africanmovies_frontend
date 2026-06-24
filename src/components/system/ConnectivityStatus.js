import {
  LoaderCircle,
  RefreshCw,
  ServerOff,
  Wifi,
  WifiOff,
} from "lucide-react";

const statusContent = {
  offline: {
    Icon: WifiOff,
    message: "Check your internet connection. We'll reconnect automatically.",
    title: "You're offline",
  },
  restored: {
    Icon: Wifi,
    message: "Everything is connected again.",
    title: "You're back online",
  },
  unavailable: {
    Icon: ServerOff,
    message:
      "Our service isn't responding yet. Your account and purchases are safe.",
    title: "AfricanMovies servers can't be reached",
  },
};

function ConnectivityStatus({ isChecking, onRetry, status }) {
  const content = statusContent[status];

  if (!content) return null;

  const { Icon, message, title } = content;
  const isRestored = status === "restored";

  return (
    <aside
      aria-atomic="true"
      className={`connectivity-status connectivity-status--${status}`}
      role={isRestored ? "status" : "alert"}
    >
      <span className="connectivity-status__icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.9} />
      </span>

      <span className="connectivity-status__copy">
        <strong>{title}</strong>
        <small>{message}</small>
      </span>

      {!isRestored ? (
        <button disabled={isChecking} onClick={onRetry} type="button">
          {isChecking ? (
            <LoaderCircle
              aria-hidden="true"
              className="connectivity-status__spinner"
              size={16}
            />
          ) : (
            <RefreshCw aria-hidden="true" size={16} />
          )}
          <span>{isChecking ? "Checking" : "Retry"}</span>
        </button>
      ) : null}
    </aside>
  );
}

export default ConnectivityStatus;
