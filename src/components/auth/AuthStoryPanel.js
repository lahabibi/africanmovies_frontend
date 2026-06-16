import { MonitorSmartphone, Play, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/img_logo.png";
import poster1 from "../../assets/images/img_poster1.png";
import poster3 from "../../assets/images/img_poster3.png";
import poster4 from "../../assets/images/img_poster4.png";
import poster5 from "../../assets/images/img_poster5.png";
import poster6 from "../../assets/images/img_poster6.png";
import poster7 from "../../assets/images/img_poster7.png";
import poster8 from "../../assets/images/img_poster8.png";
import poster18 from "../../assets/images/img_poster18.png";

const posterTiles = [
  { image: poster6, label: "King of Boys", className: "auth-poster-tile--one" },
  {
    image: poster3,
    label: "The Wedding Party",
    className: "auth-poster-tile--two",
  },
  {
    image: poster5,
    label: "Battle on Buka Street",
    className: "auth-poster-tile--three",
  },
  { image: poster7, label: "Merry Men", className: "auth-poster-tile--four" },
  {
    image: poster8,
    label: "Half of a Yellow Sun",
    className: "auth-poster-tile--five",
  },
  {
    image: poster4,
    label: "Gangs of Lagos",
    className: "auth-poster-tile--six",
  },
  {
    image: poster18,
    label: "Blood Sisters",
    className: "auth-poster-tile--seven",
  },
  { image: poster1, label: "Lionheart", className: "auth-poster-tile--eight" },
];

const storyHighlights = [
  {
    icon: Play,
    title: "Endless Entertainment",
    description: "Thousands of movies and series across all genres.",
  },
  {
    icon: MonitorSmartphone,
    title: "Watch Anywhere",
    description: "Enjoy on your phone, tablet, laptop or TV.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description: "Your privacy is our priority.",
  },
];

function AuthStoryPanel() {
  return (
    <section className="auth-story" aria-label="AfricanMovies preview">
      <div className="auth-poster-wall" aria-hidden="true">
        {posterTiles.map((tile) => (
          <img
            alt=""
            className={`auth-poster-tile ${tile.className}`}
            key={tile.label}
            src={tile.image}
          />
        ))}
      </div>

      <div className="auth-story__content">
        <Link className="auth-story__logo" to="/" aria-label="AfricanMovies home">
          <img src={logo} alt="AfricanMovies" />
        </Link>

        <h1>
          Great stories.
          <br />
          Closer to home.
        </h1>
        <p>Stream the best of African movies and series, anytime, anywhere.</p>

        <div className="auth-story__features">
          {storyHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div className="auth-story__feature" key={item.title}>
                <span>
                  <Icon aria-hidden="true" size={24} strokeWidth={2} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AuthStoryPanel;
