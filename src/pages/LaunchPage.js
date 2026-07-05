import { useEffect } from "react";
import {
  ArrowUpRight,
  Mail,
  MonitorPlay,
  Smartphone,
  TabletSmartphone,
} from "lucide-react";
import logo from "../assets/images/img_logo.png";
import posterOne from "../assets/images/launch/launch_poster_1.jpg";
import posterTwo from "../assets/images/launch/launch_poster_3.jpg";
import posterThree from "../assets/images/launch/launch_poster_4.jpg";
import posterFour from "../assets/images/launch/launch_poster_5.jpg";
import posterFive from "../assets/images/launch/launch_poster_6.jpg";
import posterSix from "../assets/images/launch/launch_poster_7.jpg";
import "../styles/launch-page.css";

const posters = [
  posterOne,
  posterTwo,
  posterThree,
  posterFour,
  posterFive,
  posterSix,
];

const pageContent = {
  "coming-soon": {
    description:
      "A new home for African movies and series is taking shape. Pay only for what you watch, build your personal library, and enjoy every story on your favorite screen.",
    eyebrow: "Made for African stories",
    headline: "AfricanMovies is coming.",
    status: "Launching soon",
    supporting: "Launching on web, iOS and Android.",
  },
  maintenance: {
    description:
      "We're making AfricanMovies better behind the scenes. Your account, purchases and library remain safe while we prepare the platform for your return.",
    eyebrow: "A brief intermission",
    headline: "We'll be back on screen shortly",
    status: "Maintenance underway",
    supporting: "Web, iOS and Android service will return together.",
  },
};

const platforms = [
  { Icon: MonitorPlay, label: "Web" },
  { Icon: TabletSmartphone, label: "iPhone & iPad" },
  { Icon: Smartphone, label: "Android" },
];

function LaunchPage({ mode = "coming-soon" }) {
  const activeMode = pageContent[mode] ? mode : "coming-soon";
  const content = pageContent[activeMode];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.title = `${content.status} | AfricanMovies`;

    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    description?.setAttribute("content", content.description);

    return () => {
      document.title = "AfricanMovies";
      if (previousDescription) {
        description?.setAttribute("content", previousDescription);
      }
    };
  }, [content.description, content.status]);

  return (
    <main className={`launch-page launch-page--${activeMode}`}>
      <div className="launch-page__poster-wall" aria-hidden="true">
        {posters.map((poster) => (
          <img alt="" key={poster} src={poster} />
        ))}
      </div>
      <span className="launch-page__veil" aria-hidden="true" />

      <header className="launch-page__header">
        <img className="launch-page__logo" src={logo} alt="AfricanMovies" />
        <span className="launch-page__status">
          <i aria-hidden="true" />
          {content.status}
        </span>
      </header>

      <section className="launch-page__content" aria-labelledby="launch-title">
        <p className="launch-page__eyebrow">{content.eyebrow}</p>
        <h1 id="launch-title">{content.headline}</h1>
        <p className="launch-page__description">{content.description}</p>

        <div
          className="launch-page__platforms"
          aria-label="AfricanMovies platforms"
        >
          {platforms.map(({ Icon, label }) => (
            <span key={label}>
              <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>

        <p className="launch-page__supporting">{content.supporting}</p>

        <a
          className="launch-page__contact"
          href="mailto:info@africanmovies.com"
        >
          <Mail aria-hidden="true" size={18} strokeWidth={1.8} />
          Contact AfricanMovies
          <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
        </a>
      </section>

      <footer className="launch-page__footer">
        <span>Great stories. Closer to home.</span>
        <span>© {currentYear} AfricanMovies</span>
      </footer>
    </main>
  );
}

export default LaunchPage;
