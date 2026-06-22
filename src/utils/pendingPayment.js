const PENDING_PAYMENT_KEY = "africanmovies.pendingPayment";

export function savePendingPayment(payment) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
}

export function getPendingPayment() {
  if (typeof window === "undefined") return null;

  try {
    const payment = window.sessionStorage.getItem(PENDING_PAYMENT_KEY);
    return payment ? JSON.parse(payment) : null;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
}

export function createPaymentIdempotencyKey(movieId, method) {
  const randomPart =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `web-${method}-${movieId}-${randomPart}`;
}

export function redirectToExternalCheckout(url) {
  window.location.assign(url);
}
