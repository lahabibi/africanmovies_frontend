import { Link } from "react-router-dom";
import {
  Bookmark,
  CircleHelp,
  CreditCard,
  Heart,
  MessageCircle,
  ReceiptText,
  UserRound,
} from "lucide-react";

const accountSidebarSections = [
  {
    id: "account",
    title: "Account",
    links: [
      { id: "profile", label: "Profile", to: "/profile", icon: UserRound },
      {
        id: "payment-details",
        label: "Payment Details",
        to: "/payment-details",
        icon: CreditCard,
      },
      {
        id: "purchase-history",
        label: "Purchase History",
        to: "/purchase-history",
        icon: ReceiptText,
      },
      {
        id: "favorites",
        label: "Favorites",
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
    id: "support",
    title: "Support",
    links: [
      { id: "help-center", label: "Help Center", to: "/support", icon: CircleHelp },
      {
        id: "contact-us",
        label: "Contact Us",
        to: "/contact-us",
        icon: MessageCircle,
      },
    ],
  },
];

function AccountSidebar({ activeId, ariaLabel = "Account navigation" }) {
  return (
    <aside className="profile-sidebar" aria-label={ariaLabel}>
      {accountSidebarSections.map((section) => (
        <section className="profile-sidebar__section" key={section.id}>
          <h2>{section.title}</h2>
          <nav aria-label={section.title}>
            {section.links.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  aria-current={link.id === activeId ? "page" : undefined}
                  className={link.id === activeId ? "is-active" : undefined}
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

export default AccountSidebar;
