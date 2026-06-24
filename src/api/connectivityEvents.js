export const API_CONNECTION_ERROR_EVENT =
  "africanmovies:api-connection-error";

export function reportApiConnectionError() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(API_CONNECTION_ERROR_EVENT));
}
