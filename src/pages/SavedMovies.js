import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Heart,
  Search,
  SearchX,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { savedMovieCollections } from "../data/savedMoviesData";

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
  { value: "releaseYear", label: "Release Year" },
];

function SavedMovies({ collectionType }) {
  const config = collectionConfig[collectionType] || collectionConfig.favorites;
  const [movies, setMovies] = useState(
    () => savedMovieCollections[collectionType] || [],
  );
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  useEffect(() => {
    setMovies(savedMovieCollections[collectionType] || []);
    setQuery("");
    setSortBy("recent");
  }, [collectionType]);

  useEffect(
    () => () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    },
    [],
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingMovies = normalizedQuery
      ? movies.filter((movie) => getMovieSearchText(movie).includes(normalizedQuery))
      : movies;

    return sortSavedMovies(matchingMovies, sortBy);
  }, [movies, query, sortBy]);

  const showNotice = (message) => {
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }

    setNotice(message);
    noticeTimer.current = window.setTimeout(() => {
      setNotice("");
      noticeTimer.current = null;
    }, 3500);
  };

  const removeMovie = (movieId) => {
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId),
    );
    showNotice(config.removedMessage);
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
          {notice ? (
            <div className="saved-movies-toast" role="status" aria-live="polite">
              <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} />
              <span>{notice}</span>
            </div>
          ) : null}

          <header className="profile-heading saved-movies-heading">
            <h1 id="saved-movies-title">{config.label}</h1>
            <p>{config.description}</p>
          </header>

          <CollectionTabs activeType={collectionType} movies={movies} />

          <div className="saved-movies-toolbar" aria-label={`${config.label} controls`}>
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

          <section className="saved-movies-results" aria-label={`${config.label} movies`}>
            <div className="saved-movies-summary">
              <strong>
                {movies.length} {movies.length === 1 ? "title" : "titles"}
              </strong>
              {query.trim() ? <span>{visibleMovies.length} matching</span> : null}
            </div>

            {visibleMovies.length ? (
              <div className="movies-grid saved-movies-grid">
                {visibleMovies.map((movie) => (
                  <SavedMovieCard
                    collectionType={collectionType}
                    key={movie.id}
                    movie={movie}
                    onRemove={removeMovie}
                  />
                ))}
              </div>
            ) : (
              <SavedMoviesEmpty
                config={config}
                hasMovies={movies.length > 0}
                onClearSearch={() => setQuery("")}
                query={query}
              />
            )}
          </section>
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function CollectionTabs({ activeType, movies }) {
  const favoritesCount =
    activeType === "favorites"
      ? movies.length
      : savedMovieCollections.favorites.length;
  const watchlistCount =
    activeType === "watchlist"
      ? movies.length
      : savedMovieCollections.watchlist.length;

  return (
    <nav className="saved-movies-tabs" aria-label="Saved movie collections">
      <Link
        aria-current={activeType === "favorites" ? "page" : undefined}
        className={activeType === "favorites" ? "is-active" : undefined}
        to="/favorites"
      >
        <Heart aria-hidden="true" size={18} strokeWidth={1.9} />
        Favorites
        <span>{favoritesCount}</span>
      </Link>
      <Link
        aria-current={activeType === "watchlist" ? "page" : undefined}
        className={activeType === "watchlist" ? "is-active" : undefined}
        to="/watchlist"
      >
        <Bookmark aria-hidden="true" size={18} strokeWidth={1.9} />
        Watchlist
        <span>{watchlistCount}</span>
      </Link>
    </nav>
  );
}

function SavedMovieCard({ collectionType, movie, onRemove }) {
  const Icon = collectionType === "favorites" ? Heart : Bookmark;
  const collectionLabel =
    collectionType === "favorites" ? "favorites" : "watchlist";

  return (
    <div className="saved-movie-card">
      <MoviePosterCard movie={movie} />
      <button
        aria-label={`Remove ${movie.title} from ${collectionLabel}`}
        className="saved-movie-card__remove"
        onClick={() => onRemove(movie.id)}
        title={`Remove from ${collectionLabel}`}
        type="button"
      >
        <Icon aria-hidden="true" fill="currentColor" size={17} strokeWidth={1.8} />
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
  const cast = Array.isArray(movie.cast) ? movie.cast : [];

  return [movie.title, ...cast]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

  if (sortBy === "releaseYear") {
    return sortedMovies.sort(
      (firstMovie, secondMovie) =>
        Number(secondMovie.year || 0) - Number(firstMovie.year || 0) ||
        firstMovie.title.localeCompare(secondMovie.title),
    );
  }

  return sortedMovies.sort(
    (firstMovie, secondMovie) =>
      new Date(secondMovie.savedAt).getTime() -
      new Date(firstMovie.savedAt).getTime(),
  );
}

export default SavedMovies;
