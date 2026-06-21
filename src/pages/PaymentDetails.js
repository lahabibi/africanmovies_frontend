import { Link } from "react-router-dom";
import {
  ExternalLink,
  Headphones,
  LockKeyhole,
  MoreVertical,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import { paymentMethods } from "../data/paymentData";

function PaymentDetails() {
  return (
    <AppShell>
      <main className="profile-page payment-page">
        <AccountSidebar activeId="payment-details" ariaLabel="Payment settings" />

        <section className="profile-content" aria-labelledby="payment-title">
          <div className="profile-layout">
            <div className="profile-main">
              <header className="profile-heading payment-heading">
                <h1 id="payment-title">Payment Details</h1>
                <p>Manage your saved payment methods and billing information.</p>
              </header>

              <SavedPaymentMethods />
            </div>

            <NeedHelpCard />
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function SavedPaymentMethods() {
  return (
    <section className="profile-panel payment-methods-panel" aria-labelledby="saved-payments-title">
      <div className="payment-methods-panel__heading">
        <h2 id="saved-payments-title">Saved Payment Methods</h2>
        <p>View and manage your payment methods.</p>
      </div>

      <div className="payment-method-list">
        {paymentMethods.map((method) => (
          <PaymentMethodCard method={method} key={method.id} />
        ))}
      </div>

      <p className="payment-security-note">
        <LockKeyhole aria-hidden="true" size={18} strokeWidth={1.7} />
        Your payment information is secure and encrypted.
      </p>
    </section>
  );
}

function PaymentMethodCard({ method }) {
  return (
    <article className="payment-method-card">
      <PaymentBrand brand={method.brand} />

      <div className="payment-method-card__details">
        <strong>
          {method.title}
          {method.isDefault ? <em>Default</em> : null}
        </strong>
        <small>Expires {method.expires}</small>
      </div>

      {!method.isDefault ? (
        <button className="payment-method-card__default" type="button">
          Set as default
        </button>
      ) : null}

      <button className="payment-method-card__more" type="button" aria-label={`Manage ${method.title}`}>
        <MoreVertical aria-hidden="true" size={20} strokeWidth={1.9} />
      </button>
    </article>
  );
}

function PaymentBrand({ brand }) {
  if (brand === "mastercard") {
    return (
      <span className="payment-brand payment-brand--mastercard" aria-label="Mastercard">
        <span />
        <span />
      </span>
    );
  }

  return (
    <span className={`payment-brand payment-brand--${brand}`}>
      {brand === "visa" ? "VISA" : "Verve"}
    </span>
  );
}

function NeedHelpCard() {
  return (
    <aside className="profile-help-card payment-help-card" aria-labelledby="payment-help-title">
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
