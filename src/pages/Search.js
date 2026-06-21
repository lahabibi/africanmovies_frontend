import { useMemo } from "react";
import { Search as SearchIcon, SearchX, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { popularSearches, searchMovies } from "../data/searchData";

const POPULAR_MOVIE_COUNT = 12;

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return searchMovies.slice(0, POPULAR_MOVIE_COUNT);
    }

    return searchMovies
      .map((movie) => ({
        movie,
        score: getSearchScore(movie, normalizedQuery),
      }))
      .filter((result) => result.score > 0)
      .sort(
        (firstResult, secondResult) =>
          secondResult.score - firstResult.score ||
          firstResult.movie.title.localeCompare(secondResult.movie.title),
      )
      .map((result) => result.movie);
  }, [normalizedQuery]);

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
            <p>Find movies by title, actor, genre or language.</p>
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
              placeholder="Search movies, actors, genres..."
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

          {!normalizedQuery ? (
            <div className="search-page__suggestions">
              <span>Popular searches</span>
              <div>
                {popularSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => updateQuery(suggestion)}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section
          className="search-results"
          aria-labelledby="search-results-title"
        >
          <header className="search-results__header">
            <h2 id="search-results-title">
              {normalizedQuery ? "Search Results" : "Popular Now"}
            </h2>
            <span aria-live="polite">
              {normalizedQuery
                ? `${results.length} ${results.length === 1 ? "title" : "titles"}`
                : `${results.length} featured titles`}
            </span>
          </header>

          {results.length ? (
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
          ) : (
            <SearchEmpty query={query} onClear={() => updateQuery("")} />
          )}
        </section>
      </main>
      <Footer />
    </AppShell>
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

function getSearchScore(movie, query) {
  const title = String(movie.title || "").toLowerCase();
  const actors = (movie.cast || []).map(getActorName).join(" ").toLowerCase();
  const metadata = [
    movie.genre,
    movie.language,
    movie.countryName,
    movie.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (title === query) {
    return 5;
  }

  if (title.startsWith(query)) {
    return 4;
  }

  if (title.includes(query)) {
    return 3;
  }

  if (actors.includes(query)) {
    return 2;
  }

  return metadata.includes(query) ? 1 : 0;
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

export default Search;
