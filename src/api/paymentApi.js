import { apiClient } from "./client";

export function getSavedPaymentMethod() {
  return apiClient("/payment/token");
}

export function getPurchaseHistory({ limit = 100 } = {}) {
  return apiClient(`/payment/history?limit=${encodeURIComponent(limit)}`);
}

export function savePaymentMethod({ isNewCard = true, transactionId }) {
  return apiClient("/payment/token", {
    body: {
      isNewCard,
      transactionID: String(transactionId),
    },
    method: "POST",
  });
}

export function initializeHostedPayment(movieId, idempotencyKey) {
  return apiClient("/payment/initialize", {
    body: {
      movieId,
      redirectUrl: `${window.location.origin}/process-payment`,
    },
    headers: { "x-idempotency-key": idempotencyKey },
    method: "POST",
  });
}

export function chargeSavedCard(movieId, idempotencyKey) {
  return apiClient("/payment/token-charge", {
    body: { movieId },
    headers: { "x-idempotency-key": idempotencyKey },
    method: "POST",
  });
}

export function confirmPayment({ transactionId, txRef }) {
  return apiClient("/payment/confirm", {
    body: { transactionId, txRef },
    method: "POST",
  });
}

export function closePaymentAttempt({ providerStatus, txRef }) {
  return apiClient("/payment/close-attempt", {
    body: { providerStatus, txRef },
    method: "POST",
  });
}

export function getPaymentStatus(txRef) {
  return apiClient(`/payment/status/${encodeURIComponent(txRef)}`);
}

export async function waitForPaymentCompletion(
  txRef,
  { attempts = 8, interval = 1500 } = {},
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const payment = await getPaymentStatus(txRef);

    if (payment.accessGranted) return payment;
    if (payment.status === "failed") {
      throw new Error("Payment was not completed.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, interval));
  }

  throw new Error("Payment confirmation is taking longer than expected.");
}
