import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useLatestMovies } from "../hooks/useCatalog";
import {
  getFilteredMovies,
  getMoviesPageConfig,
} from "../data/allMoviesData";

const PAGE_SIZE = 24;

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
  const { data: latestMovies } = useLatestMovies(120, {
    enabled: isNewReleasesPage,
  });

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sourceMovies =
      isNewReleasesPage && latestMovies?.length > 0
        ? latestMovies.map((movie, index) => ({
            ...movie,
            sortOrder: index,
          }))
        : getFilteredMovies(pageConfig.filter);

    return sourceMovies.filter((movie) => {
      if (!normalizedQuery) {
        return true;
      }

      return [movie.title, movie.genre, movie.year, ...(movie.languages || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [isNewReleasesPage, latestMovies, pageConfig.filter, query]);

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
                placeholder="Search movies..."
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
            <strong>{sortedMovies.length} titles</strong>
            <span>Movies you purchased are marked on the poster.</span>
          </div>

          {visibleMovies.length > 0 ? (
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
          ) : (
            <div className="movies-empty">
              <strong>No movies found</strong>
              <p>Try a different search or open another category.</p>
            </div>
          )}

          {hasMoreMovies ? (
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
