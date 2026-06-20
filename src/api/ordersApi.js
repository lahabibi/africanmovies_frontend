import { apiClient } from "./client";

export function getActiveOrders() {
  return apiClient("/orders");
}
