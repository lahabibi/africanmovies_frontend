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
