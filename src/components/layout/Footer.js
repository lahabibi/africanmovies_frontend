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
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "How It Works", "Device Support"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Partners"],
  },
  {
    title: "Legal",
    links: ["Terms of Use", "Privacy Policy", "Refund Policy", "Cookie Policy"],
  },
];

const socialLinks = [
  { label: "Facebook", icon: facebookIcon },
  { label: "Instagram", icon: instagramIcon },
  { label: "X", icon: twitterIcon },
  { label: "YouTube", icon: youtubeIcon },
];

function Footer() {
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
              {column.links.map((item) => (
                <Link key={item} to="/">
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
        <p>© 2026 AfricanMovies. All rights reserved.</p>
        <div className="site-footer__selectors">
          <button type="button">
            <Globe2 aria-hidden="true" size={22} />
            <span>English</span>
            <ChevronDown aria-hidden="true" size={16} />
          </button>
          <button type="button">
            <span>Nigeria (NGN)</span>
            <ChevronDown aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
