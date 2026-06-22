import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { useTrailerAccess } from "../../hooks/useCatalog";
import { resolveTrailerPlaybackSource } from "../../utils/trailerPlayback";
import starIcon from "../../assets/icons/ic_star.png";
import TrailerModal from "./TrailerModal";
import { getMovieCardWatchLabel } from "../../utils/watchActionLabel";

const genreDescriptions = {
  Action:
    "High-stakes action, bold choices, and dangerous alliances collide across the city.",
  Comedy:
    "Family drama, sharp humor, and unexpected chaos turn one ordinary day upside down.",
  Drama:
    "Secrets, loyalty, and ambition collide as one family fights for love and legacy.",
  Epic:
    "Power, tradition, and destiny meet in a sweeping story of courage and sacrifice.",
  Horror:
    "A quiet night turns unsettling when old stories come alive and no one feels safe.",
  Romance:
    "Love is tested by family pressure, buried secrets, and the cost of choosing forever.",
};

function MoviePosterCard({
  access,
  captionMetaItems,
  metaItems,
  movie,
  showMeta = true,
  showTitle = false,
}) {
  const detailsPath = `/movies/${movie.slug}`;
  const watchPath = `${detailsPath}?watch=now`;
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const movieId = movie.backendId || movie.id;
  const canRequestTrailerAccess = isMongoObjectId(movieId);
  const hasTrailer = Boolean(movie.trailerUrl || movie.heroMovie?.trailerUrl);
  const {
    data: trailerAccess,
    error: trailerError,
    isFetching: isTrailerFetching,
    refetch: refetchTrailerAccess,
  } = useTrailerAccess(movieId, { enabled: false });
  const trailerSource = useMemo(() => {
    if (trailerAccess) {
      return resolveTrailerPlaybackSource(trailerAccess, movie);
    }

    if (!canRequestTrailerAccess || trailerError) {
      return resolveTrailerPlaybackSource(null, movie);
    }

    return null;
  }, [canRequestTrailerAccess, movie, trailerAccess, trailerError]);
  const isTrailerLoading =
    isTrailerOpen &&
    canRequestTrailerAccess &&
    isTrailerFetching &&
    !trailerAccess &&
    !trailerError;
  const description =
    movie.description ||
    genreDescriptions[movie.genre] ||
    "A gripping African story full of emotion, tension, and unforgettable characters.";

  useEffect(() => {
    if (isTrailerOpen && canRequestTrailerAccess) {
      refetchTrailerAccess();
    }
  }, [canRequestTrailerAccess, isTrailerOpen, refetchTrailerAccess]);

  const openTrailer = () => {
    setIsTrailerOpen(true);
  };

  const closeTrailer = () => {
    setIsTrailerOpen(false);
  };

  return (
    <>
      <article className="poster-card">
        <div className="poster-card__image">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} />
          ) : (
            <div
              aria-label={`Artwork unavailable for ${movie.title}`}
              className="poster-card__artwork-empty"
              role="img"
            >
              <Film aria-hidden="true" size={32} strokeWidth={1.4} />
              <span>Artwork unavailable</span>
            </div>
          )}

          {access ? (
            <span
              className={`poster-card__access-badge poster-card__access-badge--${access.status}`}
            >
              {access.statusLabel}
            </span>
          ) : null}

          <span className="poster-card__bottom-glow" aria-hidden="true" />

          <Link
            className="poster-card__tap-target"
            to={detailsPath}
            aria-label={`View details for ${movie.title}`}
          />

          <span className="poster-card__scrim" aria-hidden="true" />

          <div className="poster-card__overlay">
            <div className="poster-card__eyebrow">
              <span className="poster-card__maturity">
                {movie.maturityRating}
              </span>
              <span>{movie.year}</span>
              <span>{movie.genre}</span>
            </div>

            <h3>{movie.title}</h3>
            <p>{description}</p>

            {access ? (
              <div className="poster-card__overlay-actions poster-card__overlay-actions--single">
                <Link
                  className="poster-card__action poster-card__action--primary"
                  to={`${detailsPath}?watch=${
                    access.completed ? "now" : "resume"
                  }`}
                >
                  {access.completed ? "Watch Again" : "Resume"}
                </Link>
              </div>
            ) : (
              <>
                <div
                  className={`poster-card__overlay-actions${
                    hasTrailer ? "" : " poster-card__overlay-actions--single"
                  }`}
                >
                  <Link
                    className="poster-card__action poster-card__action--primary"
                    to={watchPath}
                  >
                    {getMovieCardWatchLabel(movie)}
                  </Link>
                  {hasTrailer ? (
                    <button
                      aria-label={`Watch trailer for ${movie.title}`}
                      className="poster-card__action poster-card__action--ghost"
                      onClick={openTrailer}
                      type="button"
                    >
                      Trailer
                    </button>
                  ) : null}
                </div>

                <Link className="poster-card__details" to={detailsPath}>
                  Explore Story
                </Link>
              </>
            )}
          </div>

          {access?.timeLabel ? (
            <span className="poster-card__watch-status">
              <small>{access.timeLabel}</small>
              <span>
                <span style={{ width: `${access.progress}%` }} />
              </span>
            </span>
          ) : null}
        </div>

        {showTitle ? (
          <div className="poster-card__caption">
            <h3>{movie.title}</h3>
            <div className="poster-card__meta poster-card__meta--caption">
              {(captionMetaItems || [movie.year, movie.duration]).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ) : showMeta ? (
          <div className="poster-card__meta">
            {(metaItems || [
              {
                className: "poster-card__maturity",
                label: movie.maturityRating,
              },
              movie.genre,
              movie.duration,
            ]).map((item) => renderMetaItem(item))}
          </div>
        ) : null}
      </article>

      {isTrailerOpen && hasTrailer ? (
        <TrailerModal
          error={trailerError}
          isLoading={isTrailerLoading}
          movie={movie}
          onClose={closeTrailer}
          source={trailerSource}
        />
      ) : null}
    </>
  );
}

function renderMetaItem(item) {
  if (!item) {
    return null;
  }

  if (typeof item === "string" || typeof item === "number") {
    return <span key={item}>{item}</span>;
  }

  return (
    <span className={item.className} key={`${item.type || "meta"}-${item.label}`}>
      {item.type === "rating" ? (
        <img src={starIcon} alt="" aria-hidden="true" />
      ) : null}
      {item.label}
    </span>
  );
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

export default MoviePosterCard;
