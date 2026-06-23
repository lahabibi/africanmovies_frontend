import { apiClient } from "./client";
import { getDevicePayload } from "../utils/deviceInfo";

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
      ...getDevicePayload(),
    },
    requireAuth: false,
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
