import { ChevronDown, ChevronRight, Crown, Film, Grid2X2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import clockIcon from "../assets/icons/ic_clock.png";
import playCircleIcon from "../assets/icons/ic_play_button_circle.png";
import starIcon from "../assets/icons/ic_star.png";
import { genreFilters, genreMovies, genres } from "../data/genreData";

const fallbackIcons = {
  crown: Crown,
  film: Film,
};

function Genres() {
  const { genreSlug } = useParams();
  const selectedGenre = genres.find((genre) => genre.id === genreSlug);
  const isAllGenres = !selectedGenre;
  const movies = selectedGenre ? genreMovies[selectedGenre.id] || [] : [];

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
            <div className="genres-page__heading">
              <GenreIcon genre={selectedGenre} size="large" />
              <span>
                <h1>{selectedGenre.title}</h1>
                <p>{selectedGenre.detailDescription}</p>
              </span>
            </div>
          )}

          <div className="genres-page__controls">
            <GenreFilterBar activeId={selectedGenre?.id || "all"} />
            <button className="genre-sort-button" type="button">
              <span>Sort by: Popular</span>
              <ChevronDown aria-hidden="true" size={17} strokeWidth={2} />
            </button>
          </div>
        </section>

        {isAllGenres ? (
          <section className="genre-card-grid" aria-label="All genres">
            {genres.map((genre) => (
              <GenreCard genre={genre} key={genre.id} />
            ))}
          </section>
        ) : (
          <section
            className="genre-detail"
            aria-labelledby="genre-detail-title"
          >
            <h2 id="genre-detail-title">
              {selectedGenre.title} Movies & Shows
            </h2>
            <div className="genre-movie-grid">
              {movies.map((movie) => (
                <GenreMovieCard movie={movie} key={movie.id} />
              ))}
            </div>
            <div className="genre-callout">
              <div className="genre-callout__icon">
                <GenreIcon genre={selectedGenre} />
              </div>
              <span>
                <strong>
                  {selectedGenre.id === "comedy"
                    ? "More Laughs, More Fun"
                    : `More ${selectedGenre.title}, More Stories`}
                </strong>
                <small>
                  New {selectedGenre.title.toLowerCase()} titles added every
                  week. Stay tuned!
                </small>
              </span>
              <Link to={`/movies?genre=${selectedGenre.id}`}>
                View All {selectedGenre.title}
                <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </AppShell>
  );
}

function GenreFilterBar({ activeId }) {
  return (
    <nav className="genre-filter" aria-label="Genre filters">
      {genreFilters.map((filter) => {
        const isActive = activeId === filter.id;

        return (
          <Link
            className={isActive ? "is-active" : undefined}
            key={filter.id}
            to={filter.to}
          >
            {filter.id === "all" ? (
              <Grid2X2 aria-hidden="true" size={17} strokeWidth={2.4} />
            ) : null}
            {filter.title}
          </Link>
        );
      })}
    </nav>
  );
}

function GenreCard({ genre }) {
  return (
    <Link className="genre-card" to={`/genres/${genre.id}`}>
      <img src={genre.image} alt="" aria-hidden="true" />
      <span className="genre-card__shade" />
      <span className="genre-card__content">
        <GenreIcon genre={genre} />
        <strong>{genre.title}</strong>
        <small>{genre.description}</small>
        <em>{genre.count} Titles</em>
      </span>
    </Link>
  );
}

function GenreMovieCard({ movie }) {
  return (
    <article className="genre-movie-card">
      <Link
        className="genre-movie-card__poster"
        to={`/movies/${movie.slug}`}
        aria-label={`View ${movie.title}`}
      >
        <img src={movie.poster} alt="" aria-hidden="true" />
        <span className="genre-movie-card__shade" />
        <span className="genre-movie-card__play" aria-hidden="true">
          <img src={playCircleIcon} alt="" />
        </span>
        <span className="genre-movie-card__meta">
          <span>
            <img src={starIcon} alt="" aria-hidden="true" />
            {movie.rating}
          </span>
          {movie.year ? <span>{movie.year}</span> : null}
          <span>
            {movie.type !== "series" ? (
              <img src={clockIcon} alt="" aria-hidden="true" />
            ) : null}
            {movie.duration}
          </span>
        </span>
      </Link>
    </article>
  );
}

function GenreIcon({ genre, size = "normal" }) {
  const FallbackIcon = fallbackIcons[genre.iconType];

  return (
    <span className={`genre-icon genre-icon--${size}`}>
      {genre.icon ? (
        <img src={genre.icon} alt="" aria-hidden="true" />
      ) : (
        <FallbackIcon aria-hidden="true" size={size === "large" ? 27 : 22} />
      )}
    </span>
  );
}

export default Genres;
