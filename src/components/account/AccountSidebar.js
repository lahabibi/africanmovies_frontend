import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Heart,
  Library,
  LogOut,
  MessageCircle,
  Monitor,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { useAppShellActions } from "../layout/AppShell";

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
        id: "devices",
        label: "Devices",
        to: "/profile#active-devices",
        icon: Monitor,
      },
      {
        id: "library",
        label: "My Library",
        to: "/library",
        icon: Library,
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
        to: "mailto:info@africanmovies.com",
        icon: MessageCircle,
      },
    ],
  },
];

function AccountSidebar({ activeId, ariaLabel = "Account navigation" }) {
  const { requestLogout } = useAppShellActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const activeLink = accountSidebarSections
    .flatMap((section) => section.links)
    .find((link) => link.id === activeId);
  const ActiveIcon = activeLink?.icon || UserRound;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeId]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!sidebarRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <aside
      className={`profile-sidebar${isMobileMenuOpen ? " is-mobile-open" : ""}`}
      aria-label={ariaLabel}
      ref={sidebarRef}
    >
      <button
        aria-controls="account-sidebar-menu"
        aria-expanded={isMobileMenuOpen}
        aria-label={`${isMobileMenuOpen ? "Close" : "Open"} account menu`}
        className="profile-sidebar__mobile-toggle"
        onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        type="button"
      >
        <span>
          <ActiveIcon aria-hidden="true" size={20} strokeWidth={1.8} />
          {activeLink?.label || "Account"}
        </span>
        <ChevronDown aria-hidden="true" size={20} strokeWidth={1.8} />
      </button>

      <div className="profile-sidebar__body" id="account-sidebar-menu">
        {accountSidebarSections.map((section) => (
          <section className="profile-sidebar__section" key={section.id}>
            <h2>{section.title}</h2>
            <nav aria-label={section.title}>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isEmailLink = link.to.startsWith("mailto:");

                if (isEmailLink) {
                  return (
                    <a href={link.to} key={link.id} onClick={closeMobileMenu}>
                      <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                      <span>{link.label}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    aria-current={link.id === activeId ? "page" : undefined}
                    className={link.id === activeId ? "is-active" : undefined}
                    key={link.id}
                    onClick={() => {
                      closeMobileMenu();
                      if (link.id === "devices") {
                        window.requestAnimationFrame(() => {
                          document
                            .getElementById("active-devices")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        });
                      }
                    }}
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

        <section className="profile-sidebar__section">
          <h2>Session</h2>
          <nav aria-label="Session">
            <button
              className="profile-sidebar__logout"
              onClick={() => {
                closeMobileMenu();
                requestLogout();
              }}
              type="button"
            >
              <LogOut aria-hidden="true" size={21} strokeWidth={1.8} />
              <span>Log Out</span>
            </button>
          </nav>
        </section>
      </div>
    </aside>
  );
}

export default AccountSidebar;
