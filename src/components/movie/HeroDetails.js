import { Link } from "react-router-dom";
import clockIcon from "../../assets/icons/ic_clock.png";
import playIcon from "../../assets/icons/ic_play_button.png";
import playTv from "../../assets/icons/ic_play_tv.png";
import starIcon from "../../assets/icons/ic_star.png";

function HeroDetails({ movie, isLive = false }) {
  const detailsPath = `/movies/${movie.slug}`;
  const eyebrow = movie.releaseType || movie.eyebrow;

  return (
    <div
      className="hero-banner__content"
      aria-live={isLive ? "polite" : undefined}
    >
      {eyebrow ? <p className="hero-banner__eyebrow">{eyebrow}</p> : null}
      <h1>{movie.title}</h1>

      <div className="hero-banner__meta" aria-label="Movie metadata">
        <span>{movie.year}</span>
        <span>{movie.genre}</span>
        <span className="hero-banner__meta-icon">
          <img src={clockIcon} alt="" aria-hidden="true" />
          {movie.duration}
        </span>
        <span className="hero-banner__meta-icon hero-banner__rating">
          <img src={starIcon} alt="" aria-hidden="true" />
          {movie.rating}
        </span>
        <span className="hero-banner__maturity">{movie.maturityRating}</span>
      </div>

      <div className="hero-banner__synopsis">
        <p className="hero-banner__description">{movie.description}</p>
        <Link className="hero-banner__read-more" to={detailsPath}>
          Read More
        </Link>
      </div>

      <div className="hero-banner__actions">
        <Link className="button button--primary" to={detailsPath}>
          <img src={playIcon} alt="" aria-hidden="true" />
          <span>Watch for ${movie.price.toFixed(2)}</span>
        </Link>
        <button className="button button--ghost" type="button">
          <img src={playTv} alt="" aria-hidden="true" />
          <span>Watch Trailer</span>
        </button>
      </div>
    </div>
  );
}

export default HeroDetails;
