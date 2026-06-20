import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  Play,
  RefreshCw,
  TvMinimalPlay,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import ContentRow from "../components/movie/ContentRow";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import TrailerModal from "../components/movie/TrailerModal";
import {
  useMovieDetails,
  useMovieUserData,
  useToggleMovieFavorite,
  useToggleMovieWatchlist,
  useTrailerAccess,
} from "../hooks/useCatalog";
import { getAuthToken } from "../api/authToken";
import { formatCompactCount } from "../utils/catalogMappers";
import { resolveTrailerPlaybackSource } from "../utils/trailerPlayback";
import audioIcon from "../assets/icons/ic_audio.png";
import castIcon from "../assets/icons/ic_cast.png";
import languageIcon from "../assets/icons/ic_language.png";
import likeIcon from "../assets/icons/ic_like.png";
import likeFillIcon from "../assets/icons/ic_like_fill.png";
import productionIcon from "../assets/icons/ic_production.png";
import releaseYearIcon from "../assets/icons/ic_release_year.png";
import starIcon from "../assets/icons/ic_star.png";
import watchlistIcon from "../assets/icons/ic_watchlist.png";
import watchlistFillIcon from "../assets/icons/ic_watchlist_fill.png";

const aboutFieldIcons = {
  cast: castIcon,
  language: languageIcon,
  audio: audioIcon,
  releaseYear: releaseYearIcon,
  production: productionIcon,
};

const aboutFieldLabels = {
  cast: "Cast",
  language: "Language",
  audio: "Audio",
  releaseYear: "Release Year",
  production: "Production",
};

const aboutFieldOrder = [
  "cast",
  "language",
  "audio",
  "releaseYear",
  "production",
];

function MovieDetails() {
  const { slug } = useParams();
  const {
    data: apiMovieDetails,
    error: movieDetailsError,
    isError: isMovieDetailsError,
    isLoading: isMovieDetailsLoading,
    refetch: refetchMovieDetails,
  } = useMovieDetails(slug);
  const hasValidMovieId = isMongoObjectId(slug);
  const isMovieNotFound = !hasValidMovieId || movieDetailsError?.status === 404;

  if (isMovieDetailsLoading) {
    return <MovieDetailsSkeleton />;
  }

  if (isMovieNotFound || (!isMovieDetailsError && !apiMovieDetails?.movie)) {
    return (
      <MovieDetailsRequestState
        message="The movie may have been removed or the link is no longer available."
        title="Movie not found"
        variant="not-found"
      />
    );
  }

  if (isMovieDetailsError) {
    return (
      <MovieDetailsRequestState
        message="We could not load this movie right now. Please check your connection and try again."
        onRetry={refetchMovieDetails}
        title="Something went wrong"
        variant="error"
      />
    );
  }

  return <MovieDetailsContent movie={apiMovieDetails.movie} />;
}

function MovieDetailsContent({ movie }) {
  const location = useLocation();
  const navigate = useNavigate();
  const heroMovie = movie.heroMovie || { mode: "image", banner: movie.banner };
  const heroArtwork =
    movie.bannerPicture || heroMovie.banner || movie.banner || "";
  const hasBannerPicture =
    Boolean(heroArtwork) &&
    (movie.hasBannerPicture ??
      Boolean(movie.bannerPicture || heroMovie.banner));
  const hasTrailer = Boolean(movie.trailerUrl || heroMovie.trailerUrl);
  const priceLabel = `$${movie.price.toFixed(2)}`;
  const moreLikeThisGenre = movie.genre || movie.genres?.[0];
  const moreLikeThisViewAllTo = moreLikeThisGenre
    ? `/movies?genre=${encodeURIComponent(moreLikeThisGenre)}`
    : "/movies";
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [listActionError, setListActionError] = useState("");
  const [listActionNotice, setListActionNotice] = useState("");
  const listActionNoticeTimer = useRef(null);
  const movieId = movie.backendId || movie.id;
  const canRequestTrailerAccess = isMongoObjectId(movieId);
  const isAuthenticated = Boolean(getAuthToken());
  const { data: movieUserData, isLoading: isMovieUserDataLoading } =
    useMovieUserData(movieId, {
      enabled: isAuthenticated && canRequestTrailerAccess,
    });
  const favoriteMutation = useToggleMovieFavorite(movieId);
  const watchlistMutation = useToggleMovieWatchlist(movieId);
  const isFavorite = Boolean(movieUserData?.isFavorite);
  const isInWatchlist = Boolean(movieUserData?.inWatchlist);
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

  useEffect(() => {
    if (isTrailerOpen && canRequestTrailerAccess) {
      refetchTrailerAccess();
    }
  }, [canRequestTrailerAccess, isTrailerOpen, refetchTrailerAccess]);

  useEffect(
    () => () => {
      if (listActionNoticeTimer.current) {
        window.clearTimeout(listActionNoticeTimer.current);
      }
    },
    [],
  );

  const openTrailer = () => {
    setIsTrailerOpen(true);
  };

  const closeTrailer = () => {
    setIsTrailerOpen(false);
  };

  const redirectToSignIn = () => {
    navigate("/signin", {
      state: { from: location.pathname },
    });
  };

  const showListActionNotice = (message) => {
    if (listActionNoticeTimer.current) {
      window.clearTimeout(listActionNoticeTimer.current);
    }

    setListActionNotice(message);
    listActionNoticeTimer.current = window.setTimeout(() => {
      setListActionNotice("");
      listActionNoticeTimer.current = null;
    }, 3500);
  };

  const runListAction = async (mutation, collection) => {
    if (!isAuthenticated) {
      redirectToSignIn();
      return;
    }

    if (!canRequestTrailerAccess) {
      return;
    }

    setListActionError("");

    try {
      const response = await mutation.mutateAsync();
      const wasAdded = response?.action === "ADDED";
      const notice =
        collection === "favorites"
          ? wasAdded
            ? "Movie favorited"
            : "Movie removed from favorites"
          : wasAdded
            ? "Movie added to watchlist"
            : "Movie removed from watchlist";

      showListActionNotice(notice);
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        redirectToSignIn();
        return;
      }

      setListActionError(`We could not update your ${collection}. Try again.`);
    }
  };

  return (
    <AppShell>
      <main className="movie-detail-page">
        {listActionNotice ? (
          <div aria-live="polite" className="movie-detail-toast" role="status">
            <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2.1} />
            <span>{listActionNotice}</span>
          </div>
        ) : null}

        <section
          className="movie-detail-hero"
          aria-labelledby="movie-detail-title"
        >
          {hasBannerPicture ? (
            <img
              className="movie-detail-hero__image"
              src={heroArtwork}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <MovieDetailTrailerBackground movie={movie} />
          )}
          <span className="movie-detail-hero__shade" aria-hidden="true" />

          <div className="movie-detail-hero__content">
            <h1 id="movie-detail-title">{movie.title}</h1>

            <div className="movie-detail-hero__meta" aria-label="Movie details">
              <span>{movie.year}</span>
              <span>{movie.genres.join(", ")}</span>
              <span>{movie.duration}</span>
              <span className="movie-detail-hero__rating">
                <img src={starIcon} alt="" aria-hidden="true" />
                {movie.rating}
              </span>
              <span className="movie-detail-badge">{movie.maturityRating}</span>
              {/* <span className="movie-detail-badge">{movie.quality}</span> */}
            </div>

            {movie.description ? (
              <p className="movie-detail-hero__description">
                {movie.description}
              </p>
            ) : null}

            <div className="movie-detail-actions">
              <Link
                className="button button--primary"
                to={`/movies/${movie.slug}?watch=now`}
              >
                <Play aria-hidden="true" size={19} fill="currentColor" />
                Watch Now {priceLabel}
              </Link>

              <button
                className="button button--ghost"
                disabled={!hasTrailer}
                onClick={openTrailer}
                type="button"
              >
                <TvMinimalPlay aria-hidden="true" size={21} strokeWidth={1.9} />
                {hasTrailer ? "Watch Trailer" : "Trailer Unavailable"}
              </button>

              <button
                aria-busy={favoriteMutation.isPending}
                aria-pressed={isFavorite}
                className={`movie-detail-icon-action${
                  isFavorite ? " is-active" : ""
                }`}
                disabled={
                  favoriteMutation.isPending ||
                  (isAuthenticated &&
                    (!canRequestTrailerAccess || isMovieUserDataLoading))
                }
                onClick={() => runListAction(favoriteMutation, "favorites")}
                type="button"
              >
                <span>
                  <img
                    src={isFavorite ? likeFillIcon : likeIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </span>
                {isFavorite ? "Favorited" : "Add to Favorite"}
              </button>

              <button
                aria-busy={watchlistMutation.isPending}
                aria-pressed={isInWatchlist}
                className={`movie-detail-icon-action${
                  isInWatchlist ? " is-active" : ""
                }`}
                disabled={
                  watchlistMutation.isPending ||
                  (isAuthenticated &&
                    (!canRequestTrailerAccess || isMovieUserDataLoading))
                }
                onClick={() => runListAction(watchlistMutation, "watchlist")}
                type="button"
              >
                <span>
                  <img
                    src={isInWatchlist ? watchlistFillIcon : watchlistIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </span>
                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>

            {listActionError ? (
              <p className="movie-detail-action-error" role="alert">
                {listActionError}
              </p>
            ) : null}
          </div>
        </section>

        {isTrailerOpen && hasTrailer ? (
          <TrailerModal
            error={trailerError}
            isLoading={isTrailerLoading}
            movie={movie}
            onClose={closeTrailer}
            source={trailerSource}
          />
        ) : null}

        <section className="movie-detail-body">
          <div
            className="movie-detail-tabs"
            role="tablist"
            aria-label="Movie sections"
          >
            <button
              className="is-active"
              type="button"
              role="tab"
              aria-selected="true"
            >
              About
            </button>
            <button
              className="is-active"
              type="button"
              role="tab"
              aria-selected="true"
            >
              Cast & Crew
            </button>
            <button
              className="is-active"
              type="button"
              role="tab"
              aria-selected="true"
            >
              More Like This
            </button>
          </div>

          <div className="movie-detail-about">
            <dl className="movie-detail-facts">
              {aboutFieldOrder.map((field) => (
                <div className="movie-detail-fact" key={field}>
                  <dt>
                    <img
                      src={aboutFieldIcons[field]}
                      alt=""
                      aria-hidden="true"
                    />
                    {aboutFieldLabels[field]}
                  </dt>
                  <dd className={!movie.about[field] ? "is-empty" : ""}>
                    {movie.about[field] || "Not available"}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="movie-detail-synopsis">
              <p>
                {movie.synopsis ||
                  "A synopsis is not available for this movie yet."}
              </p>
              {movie.tags.length ? (
                <div className="movie-detail-tags" aria-label="Tags">
                  {movie.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : (
                <p className="movie-detail-tags-empty">No tags available.</p>
              )}
            </div>

            <div className="movie-detail-stats" aria-label="Audience activity">
              <StatBlock
                icon={likeIcon}
                label="Likes"
                value={movie.stats.likes}
                note="People who love this movie"
              />
              <StatBlock
                icon={watchlistIcon}
                label="Watchlist"
                value={movie.stats.watchlist}
                note="People added this to their watchlist"
              />
            </div>
          </div>

          <div className="movie-detail-more">
            {movie.moreLikeThis.length ? (
              <ContentRow
                title="More Like This"
                viewAllTo={moreLikeThisViewAllTo}
              >
                {movie.moreLikeThis.slice(0, 20).map((relatedMovie) => (
                  <MoviePosterCard
                    key={relatedMovie.id}
                    movie={relatedMovie}
                    showMeta={false}
                  />
                ))}
              </ContentRow>
            ) : (
              <MovieDetailsRelatedEmpty viewAllTo={moreLikeThisViewAllTo} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function MovieDetailsSkeleton() {
  return (
    <AppShell>
      <main
        aria-busy="true"
        aria-label="Loading movie details"
        className="movie-detail-page movie-detail-loading"
      >
        <section className="movie-detail-hero movie-detail-loading__hero">
          <div className="movie-detail-hero__content movie-detail-loading__hero-content">
            <span className="movie-detail-skeleton movie-detail-skeleton--title" />
            <span className="movie-detail-skeleton movie-detail-skeleton--meta" />
            <span className="movie-detail-skeleton movie-detail-skeleton--copy" />
            <span className="movie-detail-skeleton movie-detail-skeleton--copy-short" />
            <div className="movie-detail-loading__actions" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

        <section className="movie-detail-body movie-detail-loading__body">
          <div className="movie-detail-loading__tabs" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="movie-detail-loading__about" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, columnIndex) => (
              <div key={columnIndex}>
                {Array.from({ length: columnIndex === 2 ? 3 : 5 }).map(
                  (_, rowIndex) => (
                    <span className="movie-detail-skeleton" key={rowIndex} />
                  ),
                )}
              </div>
            ))}
          </div>

          <div className="movie-detail-loading__row" aria-hidden="true">
            <span className="movie-detail-skeleton movie-detail-skeleton--row-title" />
            <div>
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  className="movie-detail-skeleton movie-detail-skeleton--poster"
                  key={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function MovieDetailsRequestState({ message, onRetry, title, variant }) {
  const StateIcon = variant === "error" ? AlertCircle : Film;

  return (
    <AppShell>
      <main className="movie-detail-page movie-detail-request-state">
        <section
          aria-labelledby="movie-detail-state-title"
          className={`movie-detail-request-state__content movie-detail-request-state__content--${variant}`}
          role={variant === "error" ? "alert" : undefined}
        >
          <span className="movie-detail-request-state__icon">
            <StateIcon aria-hidden="true" size={32} strokeWidth={1.7} />
          </span>
          <p>{variant === "error" ? "Unable to load" : "Unavailable"}</p>
          <h1 id="movie-detail-state-title">{title}</h1>
          <span>{message}</span>
          <div className="movie-detail-request-state__actions">
            {onRetry ? (
              <button
                className="button button--primary"
                onClick={() => onRetry()}
                type="button"
              >
                <RefreshCw aria-hidden="true" size={18} strokeWidth={2} />
                Try Again
              </button>
            ) : null}
            <Link className="button button--ghost" to="/movies">
              Browse Movies
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function MovieDetailsRelatedEmpty({ viewAllTo }) {
  return (
    <section
      aria-labelledby="more-like-this-empty-title"
      className="content-row movie-detail-related-empty"
    >
      <div className="content-row__header">
        <h2 id="more-like-this-empty-title">More Like This</h2>
        <div className="content-row__actions">
          <Link to={viewAllTo}>View All</Link>
        </div>
      </div>
      <div className="movie-detail-related-empty__content">
        <span>
          <Film aria-hidden="true" size={25} strokeWidth={1.7} />
        </span>
        <div>
          <strong>No similar titles yet</strong>
          <p>More movies from this genre will appear here when available.</p>
        </div>
      </div>
    </section>
  );
}

function MovieDetailTrailerBackground({ movie }) {
  const trailerUrl = movie.trailerUrl || movie.heroMovie?.trailerUrl || "";

  if (isNativeVideoUrl(trailerUrl)) {
    return (
      <video
        autoPlay
        className="movie-detail-hero__video"
        loop
        muted
        playsInline
        poster={movie.poster}
        src={trailerUrl}
      />
    );
  }

  if (trailerUrl) {
    return (
      <iframe
        allow="autoplay; encrypted-media; picture-in-picture"
        aria-hidden="true"
        className="movie-detail-hero__video movie-detail-hero__video-frame"
        src={getBackgroundTrailerUrl(trailerUrl)}
        tabIndex="-1"
        title={`${movie.title} trailer background`}
      />
    );
  }

  if (movie.poster) {
    return (
      <img
        aria-hidden="true"
        alt=""
        className="movie-detail-hero__image"
        src={movie.poster}
      />
    );
  }

  return (
    <div
      aria-label="Artwork unavailable"
      className="movie-detail-hero__media-empty"
      role="img"
    >
      <Film aria-hidden="true" size={46} strokeWidth={1.3} />
      <span>Artwork unavailable</span>
    </div>
  );
}

function getBackgroundTrailerUrl(trailerUrl) {
  try {
    const url = new URL(trailerUrl);
    url.searchParams.set("autoplay", "true");
    url.searchParams.set("controls", "false");
    url.searchParams.set("loop", "true");
    url.searchParams.set("muted", "true");
    url.searchParams.set("preload", "auto");
    return url.toString();
  } catch {
    return trailerUrl;
  }
}

function isNativeVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

function StatBlock({ icon, label, note, value }) {
  return (
    <div className="movie-detail-stat">
      <img src={icon} alt="" aria-hidden="true" />
      <strong>{formatCompactCount(value)}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

export default MovieDetails;
