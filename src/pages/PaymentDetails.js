import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import {
  useDeleteSavedPaymentMethod,
  useSavedPaymentMethod,
} from "../hooks/usePayments";
import { getSavedCardAttentionCopy } from "../utils/paymentMethodMappers";

function PaymentDetails() {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const savedPaymentMethodQuery = useSavedPaymentMethod();
  const deleteSavedPaymentMethodMutation = useDeleteSavedPaymentMethod();

  useEffect(
    () => () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    },
    [],
  );

  const showNotice = (message, variant = "success") => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice({ message, variant });
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 3500);
  };

  const handleRemoveSavedCard = async () => {
    try {
      await deleteSavedPaymentMethodMutation.mutateAsync();
      setIsRemoveConfirmOpen(false);
      showNotice("Saved card removed successfully");
    } catch (error) {
      setIsRemoveConfirmOpen(false);
      showNotice(error?.message || "Saved card could not be removed.", "error");
    }
  };

  return (
    <AppShell>
      <main className="profile-page payment-page">
        <AccountSidebar activeId="payment-details" ariaLabel="Payment settings" />

        <section className="profile-content" aria-labelledby="payment-title">
          {notice ? (
            <div
              aria-live="polite"
              className={`profile-toast profile-toast--${notice.variant}`}
              role={notice.variant === "error" ? "alert" : "status"}
            >
              {notice.variant === "error" ? (
                <AlertCircle aria-hidden="true" size={20} strokeWidth={2} />
              ) : (
                <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} />
              )}
              <span>{notice.message}</span>
            </div>
          ) : null}

          <div className="profile-layout">
            <div className="profile-main">
              <header className="profile-heading payment-heading">
                <h1 id="payment-title">Payment Details</h1>
                <p>Manage the card saved for faster checkout.</p>
              </header>

              <SavedPaymentMethods
                isError={savedPaymentMethodQuery.isError}
                isLoading={savedPaymentMethodQuery.isLoading}
                method={savedPaymentMethodQuery.data}
                onRemove={() => setIsRemoveConfirmOpen(true)}
                onRetry={() => savedPaymentMethodQuery.refetch()}
              />
            </div>

            <NeedHelpCard />
          </div>
        </section>
      </main>
      {isRemoveConfirmOpen ? (
        <RemoveSavedCardConfirm
          isPending={deleteSavedPaymentMethodMutation.isPending}
          onCancel={() => {
            if (!deleteSavedPaymentMethodMutation.isPending) {
              setIsRemoveConfirmOpen(false);
            }
          }}
          onConfirm={handleRemoveSavedCard}
        />
      ) : null}
      <Footer />
    </AppShell>
  );
}

function SavedPaymentMethods({
  isError,
  isLoading,
  method,
  onRemove,
  onRetry,
}) {
  const hasActiveCard = method?.status === "active";
  const needsAttention = method?.status === "attention";
  const attentionCopy = needsAttention
    ? getSavedCardAttentionCopy(method.statusReason)
    : null;

  return (
    <section
      className="profile-panel payment-methods-panel"
      aria-labelledby="saved-payments-title"
    >
      <div className="payment-methods-panel__heading">
        <h2 id="saved-payments-title">Saved Card</h2>
        <p>Your account can keep one card for quicker future payments.</p>
      </div>

      {isLoading ? (
        <PaymentMethodLoading />
      ) : isError ? (
        <PaymentMethodError onRetry={onRetry} />
      ) : method ? (
        <PaymentMethodCard method={method} onRemove={onRemove} />
      ) : (
        <EmptyPaymentMethod />
      )}

      {hasActiveCard ? (
        <PaymentCardNote
          description="This card will be offered first when you pay. You can still choose a different card."
          icon={Zap}
          title="Faster checkout"
        />
      ) : null}

      {attentionCopy ? (
        <PaymentCardNote
          description={attentionCopy.description}
          icon={AlertTriangle}
          isWarning
          title={attentionCopy.title}
        />
      ) : null}

      <p className="payment-security-note">
        <LockKeyhole aria-hidden="true" size={18} strokeWidth={1.7} />
        Card details are tokenized and securely handled by Flutterwave.
      </p>
    </section>
  );
}

function PaymentMethodLoading() {
  return (
    <div
      aria-label="Loading saved card"
      className="payment-method-loading"
      role="status"
    >
      <span className="payment-method-loading__brand" />
      <span className="payment-method-loading__details">
        <i />
        <i />
      </span>
      <span className="payment-method-loading__status" />
    </div>
  );
}

function PaymentMethodError({ onRetry }) {
  return (
    <div className="payment-method-state" role="alert">
      <span aria-hidden="true">
        <AlertCircle size={25} strokeWidth={1.8} />
      </span>
      <div>
        <h3>Saved card unavailable</h3>
        <p>We couldn't load your saved card right now.</p>
      </div>
      <button onClick={onRetry} type="button">
        Try Again
      </button>
    </div>
  );
}

function PaymentCardNote({ description, icon: Icon, isWarning, title }) {
  return (
    <div
      className={`payment-checkout-note${isWarning ? " payment-checkout-note--warning" : ""}`}
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      <span>
        <strong>{title}</strong>
        {description}
      </span>
    </div>
  );
}

function PaymentMethodCard({ method, onRemove }) {
  const needsAttention = method.status === "attention";

  return (
    <article
      className={`payment-method-card${needsAttention ? " payment-method-card--expired" : ""}`}
    >
      <PaymentBrand brand={method.brand} />

      <div className="payment-method-card__details">
        <strong>{method.title}</strong>
        <small>
          {method.expires ? `Expires ${method.expires}` : "Expiry unavailable"}
        </small>
      </div>

      <div className="payment-method-card__actions">
        <span
          className={`payment-method-card__status${needsAttention ? " payment-method-card__status--expired" : ""}`}
        >
          {needsAttention ? (
            <AlertTriangle aria-hidden="true" size={16} strokeWidth={1.9} />
          ) : (
            <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.9} />
          )}
          {method.statusLabel}
        </span>
        <button
          aria-label={`Remove ${method.title}`}
          className="payment-method-card__remove"
          onClick={onRemove}
          type="button"
        >
          <Trash2 aria-hidden="true" size={16} strokeWidth={1.8} />
          Remove
        </button>
      </div>
    </article>
  );
}

function RemoveSavedCardConfirm({ isPending, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isPending) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isPending, onCancel]);

  return (
    <div className="profile-modal" onMouseDown={onCancel} role="presentation">
      <section
        aria-labelledby="remove-saved-card-title"
        aria-modal="true"
        className="profile-modal__card"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="profile-modal__heading">
          <h2 id="remove-saved-card-title">Remove saved card?</h2>
          <p>
            You can still use this card later, but you will need to enter its
            details again during checkout.
          </p>
        </div>
        <div className="profile-modal__actions">
          <button
            disabled={isPending}
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className="payment-remove-confirm__submit"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "Removing..." : "Remove Card"}
          </button>
        </div>
      </section>
    </div>
  );
}

function EmptyPaymentMethod() {
  return (
    <div className="payment-method-empty">
      <span aria-hidden="true">
        <CreditCard size={27} strokeWidth={1.7} />
      </span>
      <div>
        <h3>No saved card</h3>
        <p>You can securely save a card after your next payment.</p>
      </div>
    </div>
  );
}

function PaymentBrand({ brand }) {
  if (brand === "mastercard") {
    return (
      <span
        className="payment-brand payment-brand--mastercard"
        aria-label="Mastercard"
      >
        <span />
        <span />
      </span>
    );
  }

  return (
    <span className={`payment-brand payment-brand--${brand}`}>
      {brand === "visa" ? "VISA" : brand === "verve" ? "Verve" : "CARD"}
    </span>
  );
}

function NeedHelpCard() {
  return (
    <aside
      className="profile-help-card payment-help-card"
      aria-labelledby="payment-help-title"
    >
      <span className="profile-help-card__icon">
        <Headphones aria-hidden="true" size={31} strokeWidth={1.9} />
      </span>
      <div>
        <h2 id="payment-help-title">Need Help?</h2>
        <p>Visit our Help Center for answers to common questions.</p>
      </div>
      <Link to="/support">
        Go to Help Center
        <ExternalLink aria-hidden="true" size={15} strokeWidth={1.9} />
      </Link>
    </aside>
  );
}

export default PaymentDetails;
