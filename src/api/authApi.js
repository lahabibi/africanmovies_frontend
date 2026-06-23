import { apiClient } from "./client";
import { ensureDeviceId } from "./authToken";
import { getDeviceMetadata } from "../utils/deviceInfo";

export function requestOtp(email) {
  return apiClient("/auth/request-otp", {
    body: { email },
    requireAuth: false,
  });
}

export function verifyOtp({ email, otp }) {
  return apiClient("/auth/verify-otp", {
    body: {
      email,
      otp,
      deviceId: ensureDeviceId(),
    },
    requireAuth: false,
  });
}

export function enrichCurrentDevice() {
  return apiClient("/auth/devices/enrich", {
    body: getDeviceMetadata(),
    method: "POST",
  });
}

export function getUserById(userId) {
  return apiClient(`/auth/one-user/${userId}`);
}

export function getUserByEmail(email) {
  return apiClient(`/auth/user/${encodeURIComponent(email)}`);
}

export function logout() {
  return apiClient("/auth/logout", {
    body: {},
    method: "POST",
  });
}

export function updateUsername(username) {
  return apiClient("/auth/update-username", {
    body: { username },
    method: "POST",
  });
}

export function uploadProfileImage(file) {
  const body = new FormData();
  body.append("file", file);

  return apiClient("/auth/upload", {
    body,
    method: "POST",
  });
}

export function deleteProfileImage() {
  return apiClient("/auth/profileimage", {
    method: "DELETE",
  });
}

export function getActiveDevices() {
  return apiClient("/auth/devices");
}

export function logoutDevice(sessionId) {
  return apiClient(`/auth/devices/logout/${encodeURIComponent(sessionId)}`, {
    body: {},
    method: "POST",
  });
}

export function logoutOtherDevices() {
  return apiClient("/auth/devices/logout-others", {
    body: {},
    method: "POST",
  });
}
