const FLUTTERWAVE_SCRIPT_ID = "flutterwave-inline-script";
const FLUTTERWAVE_SCRIPT_URL = "https://checkout.flutterwave.com/v3.js";

export class FlutterwaveInlineCancelledError extends Error {
  constructor() {
    super("Payment was cancelled. No charge was completed.");
    this.name = "FlutterwaveInlineCancelledError";
    this.code = "INLINE_PAYMENT_CANCELLED";
  }
}

export async function openFlutterwaveInline({
  amount,
  currency,
  customer,
  movieTitle,
  publicKey,
  txRef,
}) {
  await loadFlutterwaveInline();

  return new Promise((resolve, reject) => {
    let settled = false;
    let modal;

    modal = window.FlutterwaveCheckout({
      amount,
      callback: (payment) => {
        if (settled) return;
        settled = true;
        modal?.close();
        resolve(payment);
      },
      currency,
      customer,
      customizations: {
        description: movieTitle ? `Watch ${movieTitle}` : "Movie purchase",
        title: "AfricanMovies",
      },
      onclose: () => {
        if (settled) return;
        settled = true;
        reject(new FlutterwaveInlineCancelledError());
      },
      payment_options: "card",
      public_key: publicKey,
      tx_ref: txRef,
    });
  });
}

function loadFlutterwaveInline() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payment checkout is unavailable."));
  }

  if (typeof window.FlutterwaveCheckout === "function") {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(FLUTTERWAVE_SCRIPT_ID);
  if (existingScript) {
    return waitForFlutterwave(existingScript);
  }

  const script = document.createElement("script");
  script.id = FLUTTERWAVE_SCRIPT_ID;
  script.async = true;
  script.src = FLUTTERWAVE_SCRIPT_URL;
  document.head.appendChild(script);
  return waitForFlutterwave(script);
}

function waitForFlutterwave(script) {
  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      if (typeof window.FlutterwaveCheckout === "function") {
        resolve();
      } else {
        reject(new Error("Payment checkout failed to load."));
      }
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Payment checkout failed to load."));
    };
    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
  });
}
