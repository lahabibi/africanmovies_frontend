import { clearAuthSession } from "./authToken";

export const AUTH_SESSION_INVALIDATED_EVENT =
  "africanmovies:auth-session-invalidated";

const INVALID_SESSION_CODES = new Set([
  "INVALID_DEVICE",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
]);

let lastNotificationAt = 0;

export function isInvalidSessionResponse(response, data) {
  return (
    [401, 403].includes(response.status) &&
    INVALID_SESSION_CODES.has(data?.code)
  );
}

export function invalidateAuthSession(data) {
  clearAuthSession();

  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();

  if (now - lastNotificationAt < 1000) {
    return;
  }

  lastNotificationAt = now;
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_INVALIDATED_EVENT, {
      detail: {
        code: data?.code,
        message: getSessionMessage(data?.code),
      },
    }),
  );
}

function getSessionMessage(code) {
  if (code === "INVALID_DEVICE") {
    return "This device has been signed out. Verify your email to sign in again.";
  }

  if (code === "TOKEN_EXPIRED") {
    return "Your session has expired. Verify your email to sign in again.";
  }

  return "Your sign-in is no longer valid. Verify your email to continue.";
}
