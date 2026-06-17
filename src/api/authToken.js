const AUTH_TOKEN_KEY = "africanmovies.authToken";
const AUTH_USER_KEY = "africanmovies.authUser";
const DEVICE_ID_KEY = "africanmovies.deviceId";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    clearAuthToken();
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const user = window.localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getDeviceId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(DEVICE_ID_KEY);
}

export function ensureDeviceId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingDeviceId = getDeviceId();

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId =
    window.crypto?.randomUUID?.() ||
    `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function clearAuthSession({ clearDevice = false } = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);

  if (clearDevice) {
    window.localStorage.removeItem(DEVICE_ID_KEY);
  }
}
