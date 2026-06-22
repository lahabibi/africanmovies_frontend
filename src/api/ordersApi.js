import { apiClient } from "./client";

export function getActiveOrders() {
  return apiClient("/orders");
}

export function getLibrary() {
  return apiClient("/orders/library");
}
