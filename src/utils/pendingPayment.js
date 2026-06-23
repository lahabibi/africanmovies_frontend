const PENDING_PAYMENT_KEY = "africanmovies.pendingPayment";
const PAYMENT_RESULT_KEY = "africanmovies.paymentResult";
export const PAYMENT_WINDOW_NAME = "africanmovies-payment";

export function savePendingPayment(payment, targetWindow = window) {
  if (!targetWindow) return false;

  try {
    const storage = targetWindow.sessionStorage;
    if (!storage) return false;
    storage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
    return true;
  } catch {
    return false;
  }
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

export function openPaymentWindow() {
  if (typeof window === "undefined") return null;

  const width = 520;
  const height = 760;
  const left = Math.max(
    0,
    (Number(window.screenX) || 0) +
      ((Number(window.outerWidth) || width) - width) / 2,
  );
  const top = Math.max(
    0,
    (Number(window.screenY) || 0) +
      ((Number(window.outerHeight) || height) - height) / 2,
  );
  let paymentWindow;

  try {
    paymentWindow = window.open(
      `${window.location.origin}/payment-processing`,
      PAYMENT_WINDOW_NAME,
      [
        "popup=yes",
        `width=${width}`,
        `height=${height}`,
        `left=${Math.round(left)}`,
        `top=${Math.round(top)}`,
        "resizable=yes",
        "scrollbars=yes",
      ].join(","),
    );
  } catch {
    return null;
  }

  paymentWindow?.focus();
  return paymentWindow;
}

export function closePaymentWindow(paymentWindow) {
  if (paymentWindow && !paymentWindow.closed) {
    paymentWindow.close();
  }
}

export function isPaymentWindow() {
  return typeof window !== "undefined" && window.name === PAYMENT_WINDOW_NAME;
}

export function publishPaymentResult(result) {
  if (typeof window === "undefined") return;

  const message = {
    ...result,
    emittedAt: Date.now(),
    source: "africanmovies-payment",
  };

  try {
    window.localStorage.setItem(PAYMENT_RESULT_KEY, JSON.stringify(message));
  } catch {
    // postMessage remains available when browser storage is unavailable.
  }

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, window.location.origin);
  }
}

export function clearPaymentResult() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PAYMENT_RESULT_KEY);
  } catch {
    // Browser privacy settings may disable storage.
  }
}

export function subscribeToPaymentResults(handler) {
  if (typeof window === "undefined") return () => undefined;

  const handleMessage = (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.source !== "africanmovies-payment") return;
    handler(event.data);
  };
  const handleStorage = (event) => {
    if (event.key !== PAYMENT_RESULT_KEY || !event.newValue) return;

    try {
      const result = JSON.parse(event.newValue);
      if (result?.source === "africanmovies-payment") handler(result);
    } catch {
      // Ignore malformed or unrelated browser storage values.
    }
  };

  window.addEventListener("message", handleMessage);
  window.addEventListener("storage", handleStorage);

  let existingResult = null;
  try {
    existingResult = window.localStorage.getItem(PAYMENT_RESULT_KEY);
  } catch {
    existingResult = null;
  }
  if (existingResult) {
    try {
      const result = JSON.parse(existingResult);
      if (result?.source === "africanmovies-payment") {
        window.queueMicrotask(() => handler(result));
      }
    } catch {
      clearPaymentResult();
    }
  }

  return () => {
    window.removeEventListener("message", handleMessage);
    window.removeEventListener("storage", handleStorage);
  };
}

export function createPaymentIdempotencyKey(movieId, method) {
  const randomPart =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `web-${method}-${movieId}-${randomPart}`;
}

export function redirectToExternalCheckout(url, paymentWindow) {
  if (!paymentWindow || paymentWindow.closed) {
    throw new Error("The payment window was blocked or closed.");
  }

  paymentWindow.location.href = url;
  paymentWindow.focus();
}
