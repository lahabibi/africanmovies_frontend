import { ChevronDown, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import androidBadge from "../../assets/images/android.png";
import appleBadge from "../../assets/images/apple.png";
import logo from "../../assets/images/img_logo.png";
import facebookIcon from "../../assets/icons/ic_facebook.png";
import instagramIcon from "../../assets/icons/ic_instagram.png";
import twitterIcon from "../../assets/icons/ic_twitter.png";
import youtubeIcon from "../../assets/icons/ic_youtube.png";

const footerColumns = [
  {
    title: "Browse",
    links: ["Movies", "Library", "Genres", "Languages"],
    to: ["/", "/library", "/genres", "/languages"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "How It Works", "Device Support"],
    to: ["help-center", "contact-us", "how-it-works", "device-support"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact Us", "Projects"],
    to: ["about-us", "careers", "contact-us", "projects"],
  },
  {
    title: "Legal",
    links: [
      "Terms of Use",
      "Privacy Policy",
      "Refund Policy",
      "Terms and Conditions",
    ],
    to: [
      "terms-of-use",
      "privacy-policy",
      "refund-policy",
      "terms-and-conditions",
    ],
  },
];

const socialLinks = [
  { label: "Facebook", icon: facebookIcon },
  { label: "Instagram", icon: instagramIcon },
  { label: "X", icon: twitterIcon },
  { label: "YouTube", icon: youtubeIcon },
];

const currencyByRegion = {
  CI: "XOF",
  GH: "GHS",
  KE: "KES",
  NG: "NGN",
  SN: "XOF",
  ZA: "ZAR",
  US: "USD",
};

const regionByTimeZone = {
  "Africa/Abidjan": "CI",
  "Africa/Accra": "GH",
  "Africa/Dakar": "SN",
  "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "America/Anchorage": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/New_York": "US",
  "America/Phoenix": "US",
  "Pacific/Honolulu": "US",
};

function Footer() {
  const currentYear = new Date().getFullYear();
  const countryLabel = getCountrySelectorLabel();

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link
            className="site-footer__logo"
            to="/"
            aria-label="AfricanMovies home"
          >
            <img src={logo} alt="AfricanMovies" />
          </Link>
          <p>
            Stream African movies on any of your devices, anytime and anywhere.
          </p>
          <div className="site-footer__social" aria-label="Social links">
            {socialLinks.map((item) => (
              <a href="/" aria-label={item.label} key={item.label}>
                <img src={item.icon} alt="" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav className="site-footer__columns" aria-label="Footer navigation">
          {footerColumns.map((column) => (
            <div className="site-footer__column" key={column.title}>
              <h2>{column.title}</h2>
              {column.links.map((item, index) => (
                <Link key={item} to={getFooterLinkTarget(column.to?.[index])}>
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="site-footer__apps">
          <h2>Get the app</h2>
          <p>Download our app and watch on the go.</p>
          <div className="app-badge-list">
            <a
              className="app-badge"
              href="/"
              aria-label="Get it on Google Play"
            >
              <img src={androidBadge} alt="" aria-hidden="true" />
            </a>
            <a
              className="app-badge"
              href="/"
              aria-label="Download on the App Store"
            >
              <img src={appleBadge} alt="" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {currentYear} AfricanMovies. All rights reserved.</p>
        <div className="site-footer__selectors">
          <button type="button">
            <Globe2 aria-hidden="true" size={22} />
            <span>English</span>
            <ChevronDown aria-hidden="true" size={16} />
          </button>
          <button type="button">
            <span>{countryLabel}</span>
            <ChevronDown aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function getCountrySelectorLabel() {
  const locale = getBrowserLocale();
  const region = getTimeZoneRegion() || getLocaleRegion(locale);
  const country = getCountryName(region, locale);

  if (!country) {
    return "Country";
  }

  const currency = currencyByRegion[region];

  return currency ? `${country} (${currency})` : country;
}

function getBrowserLocale() {
  if (typeof navigator === "undefined") {
    return "en-US";
  }

  return navigator.languages?.[0] || navigator.language || "en-US";
}

function getTimeZoneRegion() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return regionByTimeZone[timeZone] || "";
  } catch {
    return "";
  }
}

function getLocaleRegion(locale) {
  try {
    if (typeof Intl.Locale === "function") {
      return new Intl.Locale(locale).region || "";
    }
  } catch {
    return "";
  }

  return locale.split("-")[1]?.toUpperCase() || "";
}

function getCountryName(region, locale) {
  if (!region) {
    return "";
  }

  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(region) || "";
  } catch {
    return region;
  }
}

function getFooterLinkTarget(to) {
  if (!to) {
    return "/";
  }

  if (to === "/" || to.startsWith("/") || to.startsWith("http")) {
    return to;
  }

  return `/${to}`;
}

export default Footer;
