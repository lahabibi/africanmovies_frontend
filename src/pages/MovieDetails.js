import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Play, TvMinimalPlay } from "lucide-react";
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
import {
  defaultMovieDetail,
  movieDetailsBySlug,
} from "../data/movieDetailsData";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { data: apiMovieDetails } = useMovieDetails(slug);
  const movie =
    apiMovieDetails?.movie || movieDetailsBySlug[slug] || defaultMovieDetail;
  const heroMovie = movie.heroMovie || { mode: "image", banner: movie.banner };
  const hasBannerPicture =
    movie.hasBannerPicture ?? Boolean(movie.bannerPicture || heroMovie.banner);
  const priceLabel = `$${movie.price.toFixed(2)}`;
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [listActionError, setListActionError] = useState("");
  const [listActionNotice, setListActionNotice] = useState("");
  const listActionNoticeTimer = useRef(null);
  const movieId = movie.backendId || movie.id;
  const canRequestTrailerAccess = isMongoObjectId(movieId);
  const isAuthenticated = Boolean(getAuthToken());
  const {
    data: movieUserData,
    isLoading: isMovieUserDataLoading,
  } = useMovieUserData(movieId, {
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
          <div
            aria-live="polite"
            className="movie-detail-toast"
            role="status"
          >
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
              src={movie.bannerPicture || heroMovie.banner || movie.banner}
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

            <p className="movie-detail-hero__description">
              {movie.description}
            </p>

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
                onClick={openTrailer}
                type="button"
              >
                <TvMinimalPlay aria-hidden="true" size={21} strokeWidth={1.9} />
                Watch Trailer
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

        {isTrailerOpen ? (
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
            <button type="button" role="tab" aria-selected="false">
              Cast & Crew
            </button>
            <button type="button" role="tab" aria-selected="false">
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
                  <dd>{movie.about[field]}</dd>
                </div>
              ))}
            </dl>

            <div className="movie-detail-synopsis">
              <p>{movie.synopsis}</p>
              <div className="movie-detail-tags" aria-label="Tags">
                {movie.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
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
            <ContentRow title="More Like This" viewAllTo="/movies">
              {movie.moreLikeThis.map((relatedMovie) => (
                <MoviePosterCard
                  key={relatedMovie.id}
                  movie={relatedMovie}
                  showMeta={false}
                />
              ))}
            </ContentRow>
          </div>
        </section>
      </main>
      <Footer />
    </AppShell>
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

  return (
    <img
      aria-hidden="true"
      alt=""
      className="movie-detail-hero__image"
      src={movie.poster}
    />
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
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

export default MovieDetails;
