import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Heart,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useRemoveSavedMovie, useSavedMovies } from "../hooks/useCatalog";
import { useActiveOrders } from "../hooks/useOrders";
import { buildActiveMovieAccessMap } from "../utils/catalogMappers";

const collectionConfig = {
  favorites: {
    activeId: "favorites",
    description: "Movies you love, all together in one place.",
    emptyMessage: "Movies you favorite will appear here.",
    emptyTitle: "No favorites yet",
    icon: Heart,
    label: "Favorites",
    removedMessage: "Movie removed from favorites",
  },
  watchlist: {
    activeId: "watchlist",
    description: "Movies you saved to watch later.",
    emptyMessage: "Movies you add to your watchlist will appear here.",
    emptyTitle: "Your watchlist is empty",
    icon: Bookmark,
    label: "Watchlist",
    removedMessage: "Movie removed from watchlist",
  },
};

const sortOptions = [
  { value: "recent", label: "Recently Added" },
  { value: "title", label: "Title A-Z" },
];

const GRID_SKELETON_COUNT = 10;

function SavedMovies({ collectionType }) {
  const config = collectionConfig[collectionType] || collectionConfig.favorites;
  const favoritesQuery = useSavedMovies("favorites");
  const watchlistQuery = useSavedMovies("watchlist");
  const activeOrdersQuery = useActiveOrders();
  const removeMutation = useRemoveSavedMovie(collectionType);
  const activeCollectionQuery =
    collectionType === "watchlist" ? watchlistQuery : favoritesQuery;
  const movies = useMemo(
    () => activeCollectionQuery.data || [],
    [activeCollectionQuery.data],
  );
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);
  const isPageLoading =
    activeCollectionQuery.isLoading || activeOrdersQuery.isLoading;
  const isPageError = activeCollectionQuery.isError;

  const accessByMovieId = useMemo(
    () => buildActiveMovieAccessMap(activeOrdersQuery.data || [], movies),
    [activeOrdersQuery.data, movies],
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingMovies = normalizedQuery
      ? movies.filter((movie) =>
          getMovieSearchText(movie).includes(normalizedQuery),
        )
      : movies;

    return sortSavedMovies(matchingMovies, sortBy);
  }, [movies, query, sortBy]);

  useEffect(() => {
    setQuery("");
    setSortBy("recent");
    setFeedback(null);
  }, [collectionType]);

  useEffect(
    () => () => {
      if (feedbackTimer.current) {
        window.clearTimeout(feedbackTimer.current);
      }
    },
    [],
  );

  const showFeedback = (message, variant = "success") => {
    if (feedbackTimer.current) {
      window.clearTimeout(feedbackTimer.current);
    }

    setFeedback({ message, variant });
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimer.current = null;
    }, 3500);
  };

  const removeMovie = (movieId) => {
    removeMutation.mutate(movieId, {
      onError: () => {
        showFeedback("We could not remove this movie. Try again.", "error");
      },
      onSuccess: (response) => {
        if (response?.action === "REMOVED") {
          showFeedback(config.removedMessage);
          return;
        }

        showFeedback("The collection changed. Please refresh and try again.", "error");
      },
    });
  };

  return (
    <AppShell>
      <main className="profile-page saved-movies-page">
        <AccountSidebar
          activeId={config.activeId}
          ariaLabel={`${config.label} navigation`}
        />

        <section
          className="profile-content saved-movies-content"
          aria-labelledby="saved-movies-title"
        >
          {feedback ? (
            <div
              aria-live="polite"
              className={`saved-movies-toast saved-movies-toast--${feedback.variant}`}
              role={feedback.variant === "error" ? "alert" : "status"}
            >
              {feedback.variant === "error" ? (
                <AlertCircle aria-hidden="true" size={20} strokeWidth={2} />
              ) : (
                <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : null}

          <header className="profile-heading saved-movies-heading">
            <h1 id="saved-movies-title">{config.label}</h1>
            <p>{config.description}</p>
          </header>

          <CollectionTabs
            activeType={collectionType}
            favoritesCount={favoritesQuery.data?.length}
            isFavoritesLoading={favoritesQuery.isLoading}
            isWatchlistLoading={watchlistQuery.isLoading}
            watchlistCount={watchlistQuery.data?.length}
          />

          <div
            className="saved-movies-toolbar"
            aria-label={`${config.label} controls`}
          >
            <label className="movies-search">
              <span className="sr-only">Search {config.label.toLowerCase()}</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or actor..."
                type="search"
                value={query}
              />
              <Search aria-hidden="true" size={20} strokeWidth={1.8} />
            </label>

            <label className="movies-sort">
              <span>Sort by:</span>
              <select
                aria-label={`Sort ${config.label.toLowerCase()}`}
                onChange={(event) => setSortBy(event.target.value)}
                value={sortBy}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" size={18} strokeWidth={1.9} />
            </label>
          </div>

          <section
            className="saved-movies-results"
            aria-label={`${config.label} movies`}
          >
            <div className="saved-movies-summary">
              <strong>
                {isPageLoading
                  ? "Loading titles..."
                  : isPageError
                    ? "Titles unavailable"
                    : `${movies.length} ${movies.length === 1 ? "title" : "titles"}`}
              </strong>
              {!isPageLoading && !isPageError && query.trim() ? (
                <span>{visibleMovies.length} matching</span>
              ) : null}
            </div>

            {isPageLoading ? <SavedMoviesGridSkeleton /> : null}

            {!isPageLoading && isPageError ? (
              <SavedMoviesError onRetry={activeCollectionQuery.refetch} />
            ) : null}

            {!isPageLoading && !isPageError && activeOrdersQuery.isError ? (
              <div className="saved-movies-access-warning" role="status">
                <span>Library status is temporarily unavailable.</span>
                <button onClick={() => activeOrdersQuery.refetch()} type="button">
                  Retry
                </button>
              </div>
            ) : null}

            {!isPageLoading && !isPageError && visibleMovies.length ? (
              <div className="movies-grid saved-movies-grid">
                {visibleMovies.map((movie) => (
                  <SavedMovieCard
                    access={accessByMovieId.get(movie.id) || null}
                    collectionType={collectionType}
                    isRemoving={
                      removeMutation.isPending &&
                      removeMutation.variables === movie.id
                    }
                    key={movie.id}
                    movie={movie}
                    onRemove={removeMovie}
                  />
                ))}
              </div>
            ) : null}

            {!isPageLoading && !isPageError && !visibleMovies.length ? (
              <SavedMoviesEmpty
                config={config}
                hasMovies={movies.length > 0}
                onClearSearch={() => setQuery("")}
                query={query}
              />
            ) : null}
          </section>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function CollectionTabs({
  activeType,
  favoritesCount,
  isFavoritesLoading,
  isWatchlistLoading,
  watchlistCount,
}) {
  return (
    <nav className="saved-movies-tabs" aria-label="Saved movie collections">
      <Link
        aria-current={activeType === "favorites" ? "page" : undefined}
        className={activeType === "favorites" ? "is-active" : undefined}
        to="/favorites"
      >
        <Heart aria-hidden="true" size={18} strokeWidth={1.9} />
        Favorites
        <span>{isFavoritesLoading ? "..." : favoritesCount || 0}</span>
      </Link>
      <Link
        aria-current={activeType === "watchlist" ? "page" : undefined}
        className={activeType === "watchlist" ? "is-active" : undefined}
        to="/watchlist"
      >
        <Bookmark aria-hidden="true" size={18} strokeWidth={1.9} />
        Watchlist
        <span>{isWatchlistLoading ? "..." : watchlistCount || 0}</span>
      </Link>
    </nav>
  );
}

function SavedMovieCard({
  access,
  collectionType,
  isRemoving,
  movie,
  onRemove,
}) {
  const Icon = collectionType === "favorites" ? Heart : Bookmark;
  const collectionLabel =
    collectionType === "favorites" ? "favorites" : "watchlist";

  return (
    <div className="saved-movie-card">
      <MoviePosterCard access={access} movie={movie} />
      <button
        aria-label={`Remove ${movie.title} from ${collectionLabel}`}
        className="saved-movie-card__remove"
        disabled={isRemoving}
        onClick={() => onRemove(movie.id)}
        title={`Remove from ${collectionLabel}`}
        type="button"
      >
        {isRemoving ? (
          <RefreshCw
            aria-hidden="true"
            className="saved-movie-card__remove-spinner"
            size={16}
            strokeWidth={2}
          />
        ) : (
          <Icon
            aria-hidden="true"
            fill="currentColor"
            size={17}
            strokeWidth={1.8}
          />
        )}
      </button>
    </div>
  );
}

function SavedMoviesGridSkeleton() {
  return (
    <div
      aria-label="Loading saved movies"
      className="movies-grid movies-grid--loading saved-movies-grid"
    >
      {Array.from({ length: GRID_SKELETON_COUNT }).map((_, index) => (
        <article className="poster-card movies-card-skeleton" key={index}>
          <span className="movies-card-skeleton__poster" />
          <span className="movies-card-skeleton__meta" />
        </article>
      ))}
    </div>
  );
}

function SavedMoviesError({ onRetry }) {
  return (
    <div className="saved-movies-empty saved-movies-empty--error" role="alert">
      <span>
        <AlertCircle aria-hidden="true" size={28} strokeWidth={1.7} />
      </span>
      <h2>Something went wrong</h2>
      <p>We could not load this collection right now.</p>
      <button onClick={() => onRetry()} type="button">
        <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
        Try Again
      </button>
    </div>
  );
}

function SavedMoviesEmpty({ config, hasMovies, onClearSearch, query }) {
  const Icon = hasMovies ? SearchX : config.icon;
  const hasSearch = Boolean(query.trim());

  return (
    <div className="saved-movies-empty">
      <span>
        <Icon aria-hidden="true" size={28} strokeWidth={1.7} />
      </span>
      <h2>{hasSearch ? "No matching movies" : config.emptyTitle}</h2>
      <p>
        {hasSearch
          ? "Try a different title or clear your search."
          : config.emptyMessage}
      </p>
      {hasSearch ? (
        <button onClick={onClearSearch} type="button">
          Clear Search
        </button>
      ) : (
        <Link to="/movies">Browse Movies</Link>
      )}
    </div>
  );
}

function getMovieSearchText(movie) {
  const actorNames = Array.isArray(movie.cast)
    ? movie.cast.map(getActorName)
    : [];

  return [movie.title, ...actorNames]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getActorName(actor) {
  if (typeof actor === "string") {
    return actor;
  }

  if (!actor || typeof actor !== "object") {
    return "";
  }

  return (
    actor.name ||
    actor.fullName ||
    actor.actorName ||
    [actor.firstName, actor.lastName].filter(Boolean).join(" ")
  );
}

function sortSavedMovies(movies, sortBy) {
  const sortedMovies = [...movies];

  if (sortBy === "title") {
    return sortedMovies.sort((firstMovie, secondMovie) =>
      firstMovie.title.localeCompare(secondMovie.title, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }

  return sortedMovies.sort(
    (firstMovie, secondMovie) =>
      new Date(secondMovie.savedAt || 0).getTime() -
        new Date(firstMovie.savedAt || 0).getTime() ||
      firstMovie.title.localeCompare(secondMovie.title, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
  );
}

export default SavedMovies;
