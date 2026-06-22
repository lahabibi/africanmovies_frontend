import {
  AlertCircle,
  CreditCard,
  Gift,
  LoaderCircle,
  Unlock,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const loadingCopy = {
  checking: {
    title: "Checking access",
    message: "Getting this title ready for you.",
  },
  claiming: {
    title: "Claiming your movie",
    message: "Adding this title to your library.",
  },
  starting: {
    title: "Starting playback",
    message: "Preparing your secure stream.",
  },
  "payment-loading": {
    title: "Loading payment options",
    message: "Checking your saved payment method.",
  },
  "payment-processing": {
    title: "Preparing payment",
    message: "Connecting securely to Flutterwave.",
  },
};

function WatchFlowDialog({
  flow,
  onClose,
  onConfirmFree,
  onPayWithNewCard,
  onPayWithSavedCard,
  onPurchase,
  onRetry,
}) {
  const closeButtonRef = useRef(null);
  const isBusy = Boolean(loadingCopy[flow.phase]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, onClose]);

  const loadingState = loadingCopy[flow.phase];
  const movieTitle = flow.movie?.title || flow.decision?.movie?.title || "Movie";
  const price = formatPrice(
    flow.decision?.movie?.price,
    flow.decision?.movie?.currency,
  );

  return createPortal(
    <div
      className="watch-flow-modal"
      onMouseDown={isBusy ? undefined : onClose}
      role="presentation"
    >
      <section
        aria-busy={isBusy || undefined}
        aria-label={loadingState?.title || "Watch movie"}
        aria-modal="true"
        className="watch-flow-modal__dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        {!isBusy ? (
          <button
            aria-label="Close"
            className="watch-flow-modal__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={2} />
          </button>
        ) : null}

        {loadingState ? (
          <WatchDialogBody
            icon={<LoaderCircle className="watch-flow-modal__spinner" />}
            message={loadingState.message}
            title={loadingState.title}
          />
        ) : null}

        {flow.phase === "claim" ? (
          <>
            <WatchDialogBody
              icon={<Gift />}
              message="This free access can only be claimed once. Your viewing window begins when playback starts."
              title={`Watch ${movieTitle} free?`}
            />
            <div className="watch-flow-modal__actions">
              <button onClick={onClose} type="button">
                Not now
              </button>
              <button
                className="watch-flow-modal__primary"
                onClick={onConfirmFree}
                type="button"
              >
                Claim & Watch
              </button>
            </div>
          </>
        ) : null}

        {flow.phase === "purchase" ? (
          <>
            <WatchDialogBody
              icon={<Unlock />}
              message={
                flow.decision?.reason === "FREE_ACCESS_EXPIRED"
                  ? `Your free access has ended. This title is available again for ${price}.`
                  : `This title requires a one-time payment of ${price} before playback.`
              }
              title={`Unlock ${movieTitle}`}
            />
            <div className="watch-flow-modal__actions">
              <button onClick={onClose} type="button">
                Cancel
              </button>
              <button
                className="watch-flow-modal__primary"
                onClick={onPurchase}
                type="button"
              >
                Pay {price}
              </button>
            </div>
          </>
        ) : null}

        {flow.phase === "payment-choice" ? (
          <>
            <WatchDialogBody
              icon={<CreditCard />}
              message="Use your saved card or choose a different card for this payment."
              title="Choose payment method"
            />

            <div className="watch-flow-modal__saved-card">
              <span aria-hidden="true">
                <CreditCard size={22} strokeWidth={1.8} />
              </span>
              <div>
                <strong>
                  {formatCardBrand(flow.savedPayment?.cardType)} ending in {flow.savedPayment?.last4Digits || "card"}
                </strong>
                {flow.savedPayment?.expiry ? (
                  <small>Expires {flow.savedPayment.expiry}</small>
                ) : null}
              </div>
            </div>

            <div className="watch-flow-modal__actions">
              <button onClick={onPayWithNewCard} type="button">
                Use another card
              </button>
              <button
                className="watch-flow-modal__primary"
                onClick={onPayWithSavedCard}
                type="button"
              >
                Pay {price}
              </button>
            </div>
          </>
        ) : null}

        {flow.phase === "error" ? (
          <>
            <WatchDialogBody
              icon={<AlertCircle />}
              message={flow.error || "We could not prepare this movie right now."}
              title="Playback unavailable"
              variant="error"
            />
            <div className="watch-flow-modal__actions">
              <button onClick={onClose} type="button">
                Close
              </button>
              <button
                className="watch-flow-modal__primary"
                onClick={onRetry}
                type="button"
              >
                Try again
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}

function WatchDialogBody({ icon, message, title, variant = "default" }) {
  return (
    <div className={`watch-flow-modal__body watch-flow-modal__body--${variant}`}>
      <span className="watch-flow-modal__icon" aria-hidden="true">
        {icon}
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

function formatPrice(value, currency = "USD") {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "the listed price";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
  }).format(price);
}

function formatCardBrand(value) {
  if (!value) return "Card";

  const brand = String(value).trim();
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export default WatchFlowDialog;
