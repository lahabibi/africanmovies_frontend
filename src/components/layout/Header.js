import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  CircleHelp,
  CreditCard,
  LogOut,
  Menu,
  Monitor,
  UserRound,
  X,
} from "lucide-react";
import logo from "../../assets/images/img_logo.png";
import defaultAvatar from "../../assets/images/img_profile.png";
import searchIcon from "../../assets/icons/ic_search.png";
import IconButton from "../ui/IconButton";

const navItems = [
  { label: "Movies", to: "/" },
  { label: "Genres", to: "/genres" },
  { label: "Languages", to: "/languages" },
];

const authenticatedNavItems = [
  ...navItems,
  { label: "My Library", to: "/library" },
];

const profileMenuItems = [
  { label: "My Profile", to: "/profile", icon: UserRound },
  { label: "Payment Details", to: "/payment-details", icon: CreditCard },
  { label: "Devices", to: "/devices", icon: Monitor },
  {
    label: "Help & Support",
    to: "/support",
    icon: CircleHelp,
    separated: true,
  },
];

function Header({ currentUser, onLogoutRequest }) {
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(currentUser);
  const visibleNavItems = isAuthenticated ? authenticatedNavItems : navItems;
  const userName = currentUser?.name || currentUser?.username || "User";
  const userEmail = currentUser?.email || "";
  const userAvatar =
    currentUser?.avatar || currentUser?.profileURL || defaultAvatar;

  const isNavItemActive = (to, isActive) => {
    if (to === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/movies")
      );
    }

    return isActive;
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          className="app-header__brand"
          to="/"
          aria-label="AfricanMovies home"
        >
          <img src={logo} alt="AfricanMovies" />
        </Link>

        <nav className="app-header__nav" aria-label="Primary navigation">
          {visibleNavItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isNavItemActive(item.to, isActive) ? "is-active" : undefined
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__actions">
          <IconButton
            className={location.pathname === "/search" ? "is-active" : ""}
            label="Search"
            icon={searchIcon}
            to="/search"
          />
          <button
            aria-controls="mobile-primary-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
            className="app-header__menu-button icon-button"
            onClick={() => {
              setIsProfileMenuOpen(false);
              setIsMobileMenuOpen((isOpen) => !isOpen);
            }}
            type="button"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" size={22} />
            ) : (
              <Menu aria-hidden="true" size={23} />
            )}
          </button>
          {isAuthenticated ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                className="profile-menu__trigger"
                type="button"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileMenuOpen((isOpen) => !isOpen);
                }}
              >
                <img src={userAvatar} alt="" aria-hidden="true" />
                <span>{userName}</span>
                <span className="profile-menu__chevron" aria-hidden="true" />
              </button>

              {isProfileMenuOpen ? (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown__summary">
                    <img src={userAvatar} alt="" aria-hidden="true" />
                    <span>
                      <strong>{userName}</strong>
                      <small>{userEmail}</small>
                    </span>
                  </div>

                  <div className="profile-dropdown__links">
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          className={
                            item.separated ? "is-separated" : undefined
                          }
                          key={item.to}
                          role="menuitem"
                          to={item.to}
                        >
                          <Icon
                            aria-hidden="true"
                            size={19}
                            strokeWidth={1.9}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    <button
                      className="profile-dropdown__logout"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogoutRequest?.();
                      }}
                    >
                      <LogOut aria-hidden="true" size={19} strokeWidth={1.9} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link className="sign-in-button" to="/signin">
              <span className="sign-in-button__desktop-label">GET STARTED</span>
              <span className="sign-in-button__mobile-label">SIGN IN</span>
            </Link>
          )}
        </div>
      </div>

      {isMobileMenuOpen ? (
        <>
          <nav
            aria-label="Mobile primary navigation"
            className="app-header__mobile-nav"
            id="mobile-primary-navigation"
          >
            {visibleNavItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isNavItemActive(item.to, isActive) ? "is-active" : undefined
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            aria-label="Close navigation"
            className="app-header__mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          />
        </>
      ) : null}

    </header>
  );
}

export default Header;
