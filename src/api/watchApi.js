import { apiClient } from "./client";

export function getWatchAccess(movieId) {
  return apiClient(`/orders/watch/access/${movieId}`);
}

export function claimFreeMovie(movieId) {
  return apiClient(`/orders/free-claim/${movieId}`, {
    method: "POST",
  });
}

export function createPlaybackSession(movieId) {
  return apiClient(`/orders/watch/session/${movieId}`, {
    method: "POST",
  });
}

export function completePlayback({ orderId, currentTime }) {
  return apiClient("/orders/watch/complete", {
    body: { orderId, currentTime },
    method: "POST",
  });
}

export function updatePlaybackProgress({
  orderId,
  currentTime,
  keepalive = false,
}) {
  return apiClient("/orders/currentTime", {
    body: {
      _id: orderId,
      currentTime,
    },
    keepalive,
    method: "POST",
  });
}
