import { useEffect, useState } from "react";
import {
  AlertCircle,
  Search as SearchIcon,
  SearchX,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useMovieSearch } from "../hooks/useCatalog";

const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_SKELETON_COUNT = 12;

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(
    normalizedQuery,
    SEARCH_DEBOUNCE_MS,
  );
  const {
    data: results = [],
    isError,
    isFetching,
    refetch,
  } = useMovieSearch(debouncedQuery);
  const hasSearchQuery = normalizedQuery.length > 1;
  const isWaitingForDebounce =
    hasSearchQuery && debouncedQuery !== normalizedQuery;
  const isLoading = hasSearchQuery && (isWaitingForDebounce || isFetching);

  const updateQuery = (value) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (value) {
      nextSearchParams.set("q", value);
    } else {
      nextSearchParams.delete("q");
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <AppShell>
      <main className="search-page">
        <section className="search-page__header" aria-labelledby="search-title">
          <div>
            <h1 id="search-title">Search</h1>
            <p>Find movies by title or actor.</p>
          </div>

          <form
            className="search-page__form"
            onSubmit={(event) => event.preventDefault()}
            role="search"
          >
            <SearchIcon aria-hidden="true" size={24} strokeWidth={1.8} />
            <label className="sr-only" htmlFor="movie-search-input">
              Search movies
            </label>
            <input
              autoFocus
              id="movie-search-input"
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  updateQuery("");
                }
              }}
              placeholder="Search movies or actors..."
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Clear search"
                onClick={() => updateQuery("")}
                type="button"
              >
                <X aria-hidden="true" size={20} strokeWidth={2} />
              </button>
            ) : null}
          </form>
        </section>

        <section
          className="search-results"
          aria-labelledby="search-results-title"
        >
          <header className="search-results__header">
            <h2 id="search-results-title">
              {hasSearchQuery ? "Search Results" : "Discover Movies"}
            </h2>
            <span aria-live="polite">
              {getResultsLabel({
                hasSearchQuery,
                isError,
                isLoading,
                resultCount: results.length,
              })}
            </span>
          </header>

          {!normalizedQuery ? <SearchStart /> : null}

          {normalizedQuery.length === 1 ? <SearchMinimum /> : null}

          {isLoading ? <SearchResultsSkeleton /> : null}

          {!isLoading && isError ? <SearchError onRetry={refetch} /> : null}

          {!isLoading && !isError && hasSearchQuery && results.length ? (
            <div className="movies-grid search-results__grid">
              {results.map((movie) => (
                <MoviePosterCard
                  captionMetaItems={[movie.year, movie.genre]}
                  key={movie.id}
                  movie={movie}
                  showTitle
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && hasSearchQuery && !results.length ? (
            <SearchEmpty query={query} onClear={() => updateQuery("")} />
          ) : null}
        </section>
      </main>
      <Footer />
    </AppShell>
  );
}

function SearchStart() {
  return (
    <div className="search-empty search-empty--start">
      <span>
        <SearchIcon aria-hidden="true" size={30} strokeWidth={1.7} />
      </span>
      <h2>What would you like to watch?</h2>
      <p>Search the AfricanMovies catalogue by movie title or actor name.</p>
    </div>
  );
}

function SearchMinimum() {
  return (
    <div className="search-empty search-empty--start">
      <span>
        <SearchIcon aria-hidden="true" size={30} strokeWidth={1.7} />
      </span>
      <h2>Keep typing</h2>
      <p>Enter at least two characters to search the catalogue.</p>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div
      aria-label="Searching movies"
      className="movies-grid search-results__grid"
      role="status"
    >
      {Array.from({ length: SEARCH_SKELETON_COUNT }, (_, index) => (
        <article className="poster-card movies-card-skeleton" key={index}>
          <span className="movies-card-skeleton__poster" />
          <span className="movies-card-skeleton__title" />
          <span className="movies-card-skeleton__meta" />
        </article>
      ))}
    </div>
  );
}

function SearchError({ onRetry }) {
  return (
    <div className="search-empty search-empty--error" role="alert">
      <span>
        <AlertCircle aria-hidden="true" size={30} strokeWidth={1.7} />
      </span>
      <h2>Search is unavailable</h2>
      <p>We could not search the catalogue right now. Please try again.</p>
      <button onClick={() => onRetry()} type="button">
        Try Again
      </button>
    </div>
  );
}

function SearchEmpty({ onClear, query }) {
  return (
    <div className="search-empty">
      <span>
        <SearchX aria-hidden="true" size={30} strokeWidth={1.7} />
      </span>
      <h2>No movies found</h2>
      <p>We could not find anything matching "{query.trim()}".</p>
      <button onClick={onClear} type="button">
        Clear Search
      </button>
    </div>
  );
}

function getResultsLabel({ hasSearchQuery, isError, isLoading, resultCount }) {
  if (!hasSearchQuery) {
    return "Search by title or actor";
  }

  if (isLoading) {
    return "Searching...";
  }

  if (isError) {
    return "Search failed";
  }

  return `${resultCount} ${resultCount === 1 ? "title" : "titles"}`;
}

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}

export default Search;
