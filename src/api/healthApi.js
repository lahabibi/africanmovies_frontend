import { apiClient } from "./client";

export function getBackendHealth({ signal } = {}) {
  return apiClient("/health", {
    cache: "no-store",
    monitorConnection: false,
    requireAuth: false,
    signal,
  });
}
