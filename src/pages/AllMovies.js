import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useLatestMovies, useMoviesByCategory } from "../hooks/useCatalog";
import {
  getFilteredMovies,
  getMoviesPageConfig,
} from "../data/allMoviesData";

const PAGE_SIZE = 24;
const MOVIE_GRID_SKELETON_COUNT = 12;

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "Title A-Z" },
];

function AllMovies() {
  const [searchParams] = useSearchParams();
  const pageConfig = useMemo(
    () => getMoviesPageConfig(searchParams),
    [searchParams],
  );
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);
  const isNewReleasesPage =
    pageConfig.filter.type === "section" &&
    pageConfig.filter.value === "new-releases";
  const isGenrePage = pageConfig.filter.type === "genre";
  const isLanguagePage = pageConfig.filter.type === "language";
  const latestMoviesQuery = useLatestMovies(120, {
    enabled: isNewReleasesPage,
  });
  const genreMoviesQuery = useMoviesByCategory(
    "genre",
    pageConfig.filter.value,
    { enabled: isGenrePage },
  );
  const languageMoviesQuery = useMoviesByCategory(
    "language",
    pageConfig.filter.value,
    { enabled: isLanguagePage },
  );
  const activeApiQuery = isNewReleasesPage
    ? latestMoviesQuery
    : isGenrePage
      ? genreMoviesQuery
      : isLanguagePage
        ? languageMoviesQuery
        : null;
  const isApiLoading = Boolean(activeApiQuery?.isLoading);
  const isApiError = Boolean(activeApiQuery?.isError);

  const sourceMovies = useMemo(() => {
    const apiMovies = isNewReleasesPage
      ? latestMoviesQuery.data || []
      : isGenrePage
        ? genreMoviesQuery.data || []
        : isLanguagePage
          ? languageMoviesQuery.data || []
          : getFilteredMovies(pageConfig.filter);

    return apiMovies.map((movie, index) => ({
      ...movie,
      sortOrder: index,
    }));
  }, [
    genreMoviesQuery.data,
    isGenrePage,
    isLanguagePage,
    isNewReleasesPage,
    languageMoviesQuery.data,
    latestMoviesQuery.data,
    pageConfig.filter,
  ]);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sourceMovies.filter((movie) => {
      if (!normalizedQuery) {
        return true;
      }

      return getMovieSearchText(movie).includes(normalizedQuery);
    });
  }, [
    query,
    sourceMovies,
  ]);

  const sortedMovies = useMemo(
    () => sortMovies(filteredMovies, sortBy),
    [filteredMovies, sortBy],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [pageConfig.filter, query, sortBy]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || visibleCount >= sortedMovies.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((currentCount) =>
            Math.min(currentCount + PAGE_SIZE, sortedMovies.length),
          );
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [sortedMovies.length, visibleCount]);

  const visibleMovies = sortedMovies.slice(0, visibleCount);
  const hasMoreMovies = visibleMovies.length < sortedMovies.length;

  return (
    <AppShell>
      <main className="movies-page">
        <section className="movies-page__hero" aria-labelledby="movies-title">
          <div className="movies-page__heading">
            <Breadcrumb items={pageConfig.breadcrumb} />
            <h1 id="movies-title">{pageConfig.title}</h1>
          </div>

          <div className="movies-toolbar" aria-label="Movie filters">
            <label className="movies-search">
              <span className="sr-only">Search movies</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or actor..."
                type="search"
                value={query}
              />
              <Search aria-hidden="true" size={21} strokeWidth={1.8} />
            </label>

            <label className="movies-sort">
              <span>Sort by:</span>
              <select
                aria-label="Sort movies"
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
        </section>

        <section className="movies-results" aria-label={pageConfig.title}>
          <div className="movies-results__summary">
            <strong>
              {isApiLoading
                ? "Loading titles..."
                : isApiError
                  ? "Titles unavailable"
                  : `${sortedMovies.length} titles`}
            </strong>
            <span>Movies you purchased are marked on the poster.</span>
          </div>

          {isApiLoading ? <MoviesGridSkeleton /> : null}

          {!isApiLoading && isApiError ? (
            <MoviesResultsState
              message="We could not load these movies right now."
              onRetry={activeApiQuery?.refetch}
              title="Something went wrong"
              variant="error"
            />
          ) : null}

          {!isApiLoading && !isApiError && visibleMovies.length > 0 ? (
            <div className="movies-grid">
              {visibleMovies.map((movie) => {
                const displayMovie = getDisplayMovie(movie, pageConfig);

                return (
                  <MoviePosterCard
                    access={movie.access}
                    key={movie.slug}
                    movie={displayMovie}
                  />
                );
              })}
            </div>
          ) : null}

          {!isApiLoading && !isApiError && visibleMovies.length === 0 ? (
            <MoviesResultsState
              message={
                query.trim() && sourceMovies.length > 0
                  ? "Try a different title or clear your search."
                  : "Movies will appear here once they are available."
              }
              title={
                query.trim() && sourceMovies.length > 0
                  ? "No matching movies"
                  : "No movies to show"
              }
            />
          ) : null}

          {!isApiLoading && !isApiError && hasMoreMovies ? (
            <div className="movies-load-sentinel" ref={loadMoreRef}>
              <span>Loading more movies...</span>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </AppShell>
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

function MoviesGridSkeleton() {
  return (
    <div
      className="movies-grid movies-grid--loading"
      aria-busy="true"
      aria-label="Loading movies"
    >
      {Array.from({ length: MOVIE_GRID_SKELETON_COUNT }).map((_, index) => (
        <article className="poster-card movies-card-skeleton" key={index}>
          <span className="movies-card-skeleton__poster" />
          <span className="movies-card-skeleton__title" />
          <span className="movies-card-skeleton__meta" />
        </article>
      ))}
    </div>
  );
}

function MoviesResultsState({ message, onRetry, title, variant = "empty" }) {
  const StateIcon = variant === "error" ? AlertCircle : SearchX;

  return (
    <div
      className={`movies-empty movies-empty--${variant}`}
      role={variant === "error" ? "alert" : undefined}
    >
      <span className="movies-empty__icon">
        <StateIcon aria-hidden="true" size={26} strokeWidth={1.8} />
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
      {onRetry ? (
        <button onClick={() => onRetry()} type="button">
          <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
          Try Again
        </button>
      ) : null}
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav className="movies-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const pathKey = item.toLowerCase();
        const label = toTitleCase(item);
        const to = getBreadcrumbPath(pathKey);
        const isLast = index === items.length - 1;

        return (
          <span key={`${item}-${index}`}>
            {to && !isLast ? <Link to={to}>{label}</Link> : <em>{label}</em>}
            {!isLast ? <small aria-hidden="true">&gt;</small> : null}
          </span>
        );
      })}
    </nav>
  );
}

function toTitleCase(value) {
  return value
    .split(" ")
    .map((word) =>
      word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : word,
    )
    .join(" ");
}

function getBreadcrumbPath(label) {
  if (label === "home") {
    return "/";
  }

  if (label === "genre") {
    return "/genres";
  }

  if (label === "language") {
    return "/languages";
  }

  if (label === "movies") {
    return "/movies";
  }

  return null;
}

function getDisplayMovie(movie, pageConfig) {
  if (pageConfig.filter.type !== "genre") {
    return movie;
  }

  return {
    ...movie,
    genre: pageConfig.title.replace(/ Movies$/, ""),
  };
}

function sortMovies(movies, sortBy) {
  const sortedMovies = [...movies];

  if (sortBy === "title") {
    return sortedMovies.sort((firstMovie, secondMovie) =>
      firstMovie.title.localeCompare(secondMovie.title),
    );
  }

  if (sortBy === "newest") {
    return sortedMovies.sort(
      (firstMovie, secondMovie) =>
        Number(secondMovie.year || 0) - Number(firstMovie.year || 0),
    );
  }

  if (sortBy === "rating") {
    return sortedMovies.sort(
      (firstMovie, secondMovie) => secondMovie.rating - firstMovie.rating,
    );
  }

  return sortedMovies.sort(
    (firstMovie, secondMovie) => firstMovie.sortOrder - secondMovie.sortOrder,
  );
}

export default AllMovies;
