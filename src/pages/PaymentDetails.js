import { Link } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Captions,
  CircleHelp,
  CreditCard,
  ExternalLink,
  Headphones,
  Heart,
  LockKeyhole,
  MessageCircle,
  MoreVertical,
  PlayCircle,
  Settings,
  UserRound,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import { paymentMethods } from "../data/paymentData";

const paymentSidebarSections = [
  {
    id: "account",
    title: "Account",
    links: [
      { id: "profile", label: "Profile", to: "/profile", icon: UserRound },
      {
        id: "account-settings",
        label: "Account Settings",
        to: "/account-settings",
        icon: Settings,
      },
      {
        id: "payment-details",
        label: "Payment Details",
        to: "/payment-details",
        icon: CreditCard,
      },
      {
        id: "favorited-list",
        label: "Favorited List",
        to: "/favorites",
        icon: Heart,
      },
      {
        id: "watchlist",
        label: "Watchlist",
        to: "/watchlist",
        icon: Bookmark,
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    links: [
      { id: "playback", label: "Playback", to: "/playback", icon: PlayCircle },
      {
        id: "subtitles-audio",
        label: "Subtitles & Audio",
        to: "/subtitles-audio",
        icon: Captions,
      },
      {
        id: "notifications",
        label: "Notifications",
        to: "/notifications",
        icon: Bell,
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    links: [
      { id: "help-center", label: "Help Center", to: "/support", icon: CircleHelp },
      { id: "contact-us", label: "Contact Us", to: "/contact-us", icon: MessageCircle },
    ],
  },
];

function PaymentDetails() {
  return (
    <AppShell>
      <main className="profile-page payment-page">
        <PaymentSidebar />

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

function PaymentSidebar() {
  return (
    <aside className="profile-sidebar" aria-label="Payment settings">
      {paymentSidebarSections.map((section) => (
        <section className="profile-sidebar__section" key={section.id}>
          <h2>{section.title}</h2>
          <nav aria-label={section.title}>
            {section.links.map((link) => {
              const Icon = link.icon;
              const isActive = link.id === "payment-details";

              return (
                <Link
                  className={isActive ? "is-active" : undefined}
                  key={link.id}
                  to={link.to}
                >
                  <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </section>
      ))}
    </aside>
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
