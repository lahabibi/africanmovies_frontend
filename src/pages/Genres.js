import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Film, Grid2X2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useGenres, useMoviesByCategory } from "../hooks/useCatalog";

const GENRE_CARD_SKELETON_COUNT = 8;
const GENRE_MOVIE_SKELETON_COUNT = 12;
const GENRE_MOVIE_SORT_OPTIONS = [
  { label: "Release Date", value: "release-date" },
  { label: "A-Z", value: "az" },
];

function Genres() {
  const { genreSlug } = useParams();
  const [movieSortBy, setMovieSortBy] = useState("release-date");
  const {
    data: genres = [],
    isError: isGenresError,
    isLoading: isGenresLoading,
  } = useGenres();
  const sortedGenres = useMemo(() => sortGenresByTitle(genres), [genres]);
  const selectedGenre = sortedGenres.find((genre) => genre.id === genreSlug);
  const isAllGenres = !genreSlug;
  const shouldLoadGenreMovies = Boolean(selectedGenre);
  const {
    data: genreMovies = [],
    isError: isGenreMoviesError,
    isLoading: isGenreMoviesLoading,
  } = useMoviesByCategory("genre", selectedGenre?.title, {
    enabled: shouldLoadGenreMovies,
  });
  const sortedGenreMovies = useMemo(
    () => sortGenreMovies(genreMovies, movieSortBy),
    [genreMovies, movieSortBy],
  );

  return (
    <AppShell>
      <main className="genres-page">
        <section className="genres-page__intro">
          {isAllGenres ? (
            <div className="genres-page__heading genres-page__heading--all">
              <h1>Explore Genres</h1>
              <p>
                Discover stories from Africa and beyond, across every mood and
                moment.
              </p>
            </div>
          ) : (
            <GenreDetailHeading
              genre={selectedGenre}
              isLoading={isGenresLoading}
            />
          )}

          <div className="genres-page__controls">
            <GenreFilterBar
              activeId={selectedGenre?.id || (isAllGenres ? "all" : genreSlug)}
              genres={sortedGenres}
              isLoading={isGenresLoading}
            />
            <GenreSortControl
              isAllGenres={isAllGenres}
              onChange={setMovieSortBy}
              value={movieSortBy}
            />
          </div>
        </section>

        {isAllGenres ? (
          <AllGenresContent
            genres={sortedGenres}
            isError={isGenresError}
            isLoading={isGenresLoading}
          />
        ) : (
          <GenreDetailContent
            genre={selectedGenre}
            isGenreLoading={isGenresLoading}
            isMoviesError={isGenreMoviesError}
            isMoviesLoading={isGenreMoviesLoading}
            movies={sortedGenreMovies}
          />
        )}
      </main>
      <Footer />
    </AppShell>
  );
}

function GenreDetailHeading({ genre, isLoading }) {
  if (isLoading) {
    return (
      <div className="genres-page__heading genres-page__heading--loading">
        <span className="genre-heading-skeleton genre-heading-skeleton--icon" />
        <span>
          <span className="genre-heading-skeleton genre-heading-skeleton--title" />
          <span className="genre-heading-skeleton genre-heading-skeleton--copy" />
        </span>
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="genres-page__heading genres-page__heading--all">
        <h1>Genre Not Found</h1>
        <p>This genre is not available right now.</p>
      </div>
    );
  }

  return (
    <div className="genres-page__heading">
      <GenreIcon genre={genre} size="large" />
      <span>
        <h1>{genre.title}</h1>
        {genre.description ? <p>{genre.description}</p> : null}
      </span>
    </div>
  );
}

function GenreFilterBar({ activeId, genres, isLoading }) {
  return (
    <nav className="genre-filter" aria-label="Genre filters">
      <Link className={activeId === "all" ? "is-active" : undefined} to="/genres">
        <Grid2X2 aria-hidden="true" size={17} strokeWidth={2.4} />
        All Genres
      </Link>

      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <span
              className="genre-filter__skeleton"
              key={`genre-filter-${index}`}
            />
          ))
        : genres.map((genre) => (
            <Link
              className={activeId === genre.id ? "is-active" : undefined}
              key={genre.id}
              to={`/genres/${genre.id}`}
            >
              {genre.title}
            </Link>
          ))}
    </nav>
  );
}

function GenreSortControl({ isAllGenres, onChange, value }) {
  const displayedValue = isAllGenres ? "az" : value;
  const options = isAllGenres
    ? [{ label: "A-Z", value: "az" }]
    : GENRE_MOVIE_SORT_OPTIONS;

  return (
    <label className="genre-sort-button">
      <span>Sort by:</span>
      <select
        aria-label="Sort genres"
        disabled={isAllGenres}
        onChange={(event) => onChange(event.target.value)}
        value={displayedValue}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={17} strokeWidth={2} />
    </label>
  );
}

function AllGenresContent({ genres, isError, isLoading }) {
  if (isLoading) {
    return <GenreCardGridSkeleton />;
  }

  if (isError) {
    return (
      <GenresState
        message="We could not load genres right now."
        title="Something went wrong"
      />
    );
  }

  if (!genres.length) {
    return (
      <GenresState
        message="Genres will appear here once they are available."
        title="No genres to show"
      />
    );
  }

  return (
    <section className="genre-card-grid" aria-label="All genres">
      {genres.map((genre) => (
        <GenreCard genre={genre} key={genre.id} />
      ))}
    </section>
  );
}

function GenreDetailContent({
  genre,
  isGenreLoading,
  isMoviesError,
  isMoviesLoading,
  movies,
}) {
  if (isGenreLoading) {
    return (
      <section className="genre-detail" aria-label="Loading genre movies">
        <span className="genre-detail-title-skeleton" />
        <GenreMovieGridSkeleton />
      </section>
    );
  }

  if (!genre) {
    return (
      <GenresState
        message="Choose another genre or go back to all genres."
        title="Genre not found"
      />
    );
  }

  return (
    <section className="genre-detail" aria-labelledby="genre-detail-title">
      <h2 id="genre-detail-title">{genre.title} Movies & Shows</h2>

      {isMoviesLoading ? <GenreMovieGridSkeleton /> : null}

      {isMoviesError ? (
        <GenresState
          message={`We could not load ${genre.title.toLowerCase()} movies right now.`}
          title="Something went wrong"
        />
      ) : null}

      {!isMoviesLoading && !isMoviesError && movies.length === 0 ? (
        <GenresState
          message={`${genre.title} movies will appear here once they are available.`}
          title="No movies to show"
        />
      ) : null}

      {!isMoviesLoading && !isMoviesError && movies.length > 0 ? (
        <div className="genre-movie-grid">
          {movies.map((movie) => (
            <MoviePosterCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : null}

      <div className="genre-callout">
        <div className="genre-callout__icon">
          <GenreIcon genre={genre} />
        </div>
        <span>
          <strong>More {genre.title}, More Stories</strong>
          <small>
            New {genre.title.toLowerCase()} titles will appear here as they are
            added.
          </small>
        </span>
        <Link to={`/movies?genre=${encodeURIComponent(genre.title)}`}>
          View All {genre.title}
          <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}

function GenreCard({ genre }) {
  return (
    <Link className="genre-card" to={`/genres/${genre.id}`}>
      {genre.image ? (
        <img src={genre.image} alt="" aria-hidden="true" />
      ) : (
        <span className="genre-card__image-placeholder" aria-hidden="true" />
      )}
      <span className="genre-card__shade" />
      <span className="genre-card__content">
        <GenreIcon genre={genre} />
        <strong>{genre.title}</strong>
        {genre.description ? <small>{genre.description}</small> : null}
        <em>{getGenreCountLabel(genre)}</em>
      </span>
    </Link>
  );
}

function GenreIcon({ genre, size = "normal" }) {
  const hasIcon = Boolean(genre?.icon);

  return (
    <span className={`genre-icon genre-icon--${size}`}>
      {hasIcon ? (
        <img src={genre.icon} alt="" aria-hidden="true" />
      ) : (
        <Film aria-hidden="true" size={size === "large" ? 27 : 22} />
      )}
    </span>
  );
}

function GenreCardGridSkeleton() {
  return (
    <section
      className="genre-card-grid"
      aria-busy="true"
      aria-label="Loading genres"
    >
      {Array.from({ length: GENRE_CARD_SKELETON_COUNT }).map((_, index) => (
        <div className="genre-card genre-card--skeleton" key={index}>
          <span className="genre-skeleton genre-skeleton--icon" />
          <span className="genre-skeleton genre-skeleton--title" />
          <span className="genre-skeleton genre-skeleton--copy" />
          <span className="genre-skeleton genre-skeleton--count" />
        </div>
      ))}
    </section>
  );
}

function GenreMovieGridSkeleton() {
  return (
    <div className="genre-movie-grid genre-movie-grid--loading" aria-busy="true">
      {Array.from({ length: GENRE_MOVIE_SKELETON_COUNT }).map((_, index) => (
        <article className="poster-card genre-movie-skeleton" key={index}>
          <span className="genre-movie-skeleton__poster" />
          <span className="genre-movie-skeleton__meta" />
        </article>
      ))}
    </div>
  );
}

function GenresState({ message, title }) {
  return (
    <section className="genres-state">
      <strong>{title}</strong>
      <p>{message}</p>
    </section>
  );
}

function getGenreCountLabel(genre) {
  if (typeof genre.titleCount === "number") {
    return `${genre.titleCount} ${genre.titleCount === 1 ? "Title" : "Titles"}`;
  }

  return "View Titles";
}

function sortGenresByTitle(genres) {
  return [...genres].sort((firstGenre, secondGenre) =>
    firstGenre.title.localeCompare(secondGenre.title, undefined, {
      sensitivity: "base",
    }),
  );
}

function sortGenreMovies(movies, sortBy) {
  if (sortBy === "az") {
    return sortMoviesByTitle(movies);
  }

  return sortMoviesByReleaseDate(movies);
}

function sortMoviesByTitle(movies) {
  return [...movies].sort((firstMovie, secondMovie) =>
    firstMovie.title.localeCompare(secondMovie.title, undefined, {
      sensitivity: "base",
    }),
  );
}

function sortMoviesByReleaseDate(movies) {
  return [...movies].sort((firstMovie, secondMovie) => {
    const releaseDifference =
      getMovieReleaseTime(secondMovie) - getMovieReleaseTime(firstMovie);

    if (releaseDifference) {
      return releaseDifference;
    }

    return firstMovie.title.localeCompare(secondMovie.title, undefined, {
      sensitivity: "base",
    });
  });
}

function getMovieReleaseTime(movie) {
  const rawMovie = movie.raw || {};
  const releaseDateTime = getValidDateTime(
    rawMovie.releaseDate ||
      rawMovie.releaseDateTime ||
      rawMovie.premiereDate ||
      rawMovie.publishedDate,
  );

  if (releaseDateTime) {
    return releaseDateTime;
  }

  const releaseYear = Number.parseInt(
    movie.year || rawMovie.releaseYear || rawMovie.year,
    10,
  );

  if (Number.isFinite(releaseYear)) {
    return Date.UTC(releaseYear, 11, 31);
  }

  return getValidDateTime(rawMovie.uploadDate || rawMovie.createdAt) || 0;
}

function getValidDateTime(value) {
  if (!value) {
    return 0;
  }

  const time = Date.parse(value);

  return Number.isNaN(time) ? 0 : time;
}

export default Genres;
