import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTrailerAccess } from "../../hooks/useCatalog";
import { resolveTrailerPlaybackSource } from "../../utils/trailerPlayback";
import { getWatchActionLabel } from "../../utils/watchActionLabel";
import clockIcon from "../../assets/icons/ic_clock.png";
import playIcon from "../../assets/icons/ic_play_button.png";
import playTv from "../../assets/icons/ic_play_tv.png";
import starIcon from "../../assets/icons/ic_star.png";
import TrailerModal from "./TrailerModal";

function HeroDetails({ movie, isLive = false }) {
  const detailsPath = `/movies/${movie.slug}`;
  const eyebrow = movie.releaseType || movie.eyebrow;
  const [trailerMovie, setTrailerMovie] = useState(null);
  const activeTrailerMovie = trailerMovie || movie;
  const activeTrailerMovieId =
    activeTrailerMovie?.backendId || activeTrailerMovie?.id;
  const canRequestTrailerAccess = isMongoObjectId(activeTrailerMovieId);
  const {
    data: trailerAccess,
    error: trailerError,
    isFetching: isTrailerFetching,
    refetch: refetchTrailerAccess,
  } = useTrailerAccess(activeTrailerMovieId, { enabled: false });
  const trailerSource = useMemo(() => {
    if (trailerAccess) {
      return resolveTrailerPlaybackSource(trailerAccess, activeTrailerMovie);
    }

    if (!canRequestTrailerAccess || trailerError) {
      return resolveTrailerPlaybackSource(null, activeTrailerMovie);
    }

    return null;
  }, [
    activeTrailerMovie,
    canRequestTrailerAccess,
    trailerAccess,
    trailerError,
  ]);
  const isTrailerOpen = Boolean(trailerMovie);
  const isTrailerLoading =
    isTrailerOpen &&
    canRequestTrailerAccess &&
    isTrailerFetching &&
    !trailerAccess &&
    !trailerError;

  useEffect(() => {
    if (isTrailerOpen && canRequestTrailerAccess) {
      refetchTrailerAccess();
    }
  }, [canRequestTrailerAccess, isTrailerOpen, refetchTrailerAccess]);

  const openTrailer = () => {
    setTrailerMovie(movie);
  };

  const closeTrailer = () => {
    setTrailerMovie(null);
  };

  return (
    <>
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
            <span>{getWatchActionLabel(movie, "Watch for")}</span>
          </Link>
          <button
            className="button button--ghost"
            onClick={openTrailer}
            type="button"
          >
            <img src={playTv} alt="" aria-hidden="true" />
            <span>Watch Trailer</span>
          </button>
        </div>
      </div>

      {isTrailerOpen ? (
        <TrailerModal
          error={trailerError}
          isLoading={isTrailerLoading}
          movie={activeTrailerMovie}
          onClose={closeTrailer}
          source={trailerSource}
        />
      ) : null}
    </>
  );
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

export default HeroDetails;
