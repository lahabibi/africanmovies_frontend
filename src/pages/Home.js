import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import FeatureStrip from "../components/home/FeatureStrip";
import ContentRow from "../components/movie/ContentRow";
import ContinueWatchingCard from "../components/movie/ContinueWatchingCard";
import HeroSection from "../components/movie/HeroSection";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useHomeCatalog, useLatestMovies } from "../hooks/useCatalog";
import { serviceHighlights } from "../data/homeData";

const MOVIE_ROW_SKELETON_COUNT = 8;

function Home() {
  const {
    data: homeCatalog,
    isError: isHomeError,
    isLoading: isHomeLoading,
  } = useHomeCatalog();
  const {
    data: latestMovies = [],
    isError: isLatestMoviesError,
    isLoading: isLatestMoviesLoading,
  } = useLatestMovies(50);
  const resolvedHero = hasHeroContent(homeCatalog?.homeHero)
    ? homeCatalog.homeHero
    : null;
  const resolvedContinueWatching = homeCatalog?.continueWatching || [];
  const continueWatchingRowClass =
    resolvedContinueWatching.length > 0 && resolvedContinueWatching.length < 4
      ? `content-row--continue-sparse content-row--continue-count-${resolvedContinueWatching.length}`
      : "";
  const resolvedGenreRows = homeCatalog?.genreRows || [];
  const showHeroSkeleton = isHomeLoading && !homeCatalog;
  const showLatestMoviesSkeleton =
    isLatestMoviesLoading && latestMovies.length === 0;
  const showGenreRowsSkeleton = isHomeLoading && resolvedGenreRows.length === 0;
  const showGenreRowsError = isHomeError && resolvedGenreRows.length === 0;
  const showGenreRowsEmpty =
    !isHomeLoading && !isHomeError && resolvedGenreRows.length === 0;

  return (
    <AppShell>
      <main className="home-page">
        {showHeroSkeleton ? (
          <HomeHeroSkeleton />
        ) : resolvedHero ? (
          <HeroSection hero={resolvedHero} />
        ) : (
          <HomeHeroState
            variant={isHomeError ? "error" : "empty"}
            message={
              isHomeError
                ? "We could not load the featured banner right now."
                : "Featured movies will appear here once they are available."
            }
            title={isHomeError ? "Featured unavailable" : "No featured movies"}
          />
        )}

        <div className="home-page__content">
          {resolvedContinueWatching.length > 0 ? (
            <ContentRow
              className={continueWatchingRowClass}
              title="Continue Watching"
              viewAllTo="/library"
            >
              {resolvedContinueWatching.map((item) => (
                <ContinueWatchingCard key={item.id} item={item} />
              ))}
            </ContentRow>
          ) : null}

          {latestMovies.length > 0 ? (
            <ContentRow
              title="New Releases"
              viewAllTo="/movies?section=new-releases"
            >
              {latestMovies.map((movie) => (
                <MoviePosterCard key={movie.id} movie={movie} />
              ))}
            </ContentRow>
          ) : showLatestMoviesSkeleton ? (
            <HomeMovieRowSkeleton
              title="New Releases"
              viewAllTo="/movies?section=new-releases"
            />
          ) : (
            <HomeRowState
              message={
                isLatestMoviesError
                  ? "We could not load new releases right now."
                  : "New releases will appear here once they are available."
              }
              title="New Releases"
              variant={isLatestMoviesError ? "error" : "empty"}
            />
          )}

          <FeatureStrip items={serviceHighlights} />

          {resolvedGenreRows.length > 0
            ? resolvedGenreRows.map((row) => (
                <ContentRow
                  key={row.id}
                  title={row.title}
                  viewAllTo={`/movies?genre=${encodeURIComponent(row.title)}`}
                >
                  {row.movies.map((movie) => (
                    <MoviePosterCard key={movie.id} movie={movie} />
                  ))}
                </ContentRow>
              ))
            : null}

          {showGenreRowsSkeleton ? (
            <HomeMovieRowSkeleton title="Movies by Genre" viewAllTo="/movies" />
          ) : null}

          {showGenreRowsError ? (
            <HomeRowState
              message="We could not load genre rows right now."
              title="Movies by Genre"
              variant="error"
            />
          ) : null}

          {showGenreRowsEmpty ? (
            <HomeRowState
              message="Genre rows will appear here once movies are available."
              title="Movies by Genre"
              variant="empty"
            />
          ) : null}
        </div>

        <Footer />
      </main>
    </AppShell>
  );
}

function HomeHeroSkeleton() {
  return (
    <section
      className="hero-banner hero-banner--state hero-banner--skeleton"
      aria-busy="true"
      aria-label="Loading featured movie"
    >
      <div className="hero-banner__state hero-banner__state--skeleton">
        <span className="hero-banner__state-mark" aria-hidden="true" />
        <span className="hero-skeleton hero-skeleton--eyebrow" />
        <span className="hero-skeleton hero-skeleton--title" />
        <span className="hero-skeleton hero-skeleton--title-short" />
        <span className="hero-skeleton hero-skeleton--meta" />
        <span className="hero-skeleton hero-skeleton--copy" />
        <span className="hero-skeleton hero-skeleton--copy-short" />
        <div className="hero-skeleton-actions" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
      <div className="hero-skeleton-poster" aria-hidden="true" />
    </section>
  );
}

function HomeHeroState({ message, title, variant = "empty" }) {
  return (
    <section
      className={[
        "hero-banner",
        "hero-banner--state",
        `hero-banner--state-${variant}`,
      ].join(" ")}
      aria-label="Featured movie"
    >
      <div className="hero-banner__state">
        <span className="hero-banner__state-mark" aria-hidden="true" />
        <p>{variant === "error" ? "Unable to load" : "Coming soon"}</p>
        <h1>{title}</h1>
        <span>{message}</span>
      </div>
    </section>
  );
}

function HomeMovieRowSkeleton({ title, viewAllTo }) {
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-loading-title`;
  const scrollerId = `${titleId}-scroller`;

  return (
    <section
      className="content-row content-row--loading"
      aria-busy="true"
      aria-labelledby={titleId}
    >
      <div className="content-row__header">
        <h2 id={titleId}>{title}</h2>
        {viewAllTo ? (
          <div className="content-row__actions">
            <span className="home-row-loading-link">View All</span>
          </div>
        ) : null}
      </div>
      <div className="content-row__scroller" id={scrollerId}>
        {Array.from({ length: MOVIE_ROW_SKELETON_COUNT }).map((_, index) => (
          <MoviePosterSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function HomeRowState({ message, title, variant = "empty" }) {
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-state-title`;

  return (
    <section
      className={`content-row home-row-state home-row-state--${variant}`}
      aria-labelledby={titleId}
    >
      <div className="content-row__header">
        <h2 id={titleId}>{title}</h2>
      </div>
      <div className="home-empty-state">
        <strong>
          {variant === "error" ? "Something went wrong" : "No movies to show"}
        </strong>
        <p>{message}</p>
      </div>
    </section>
  );
}

function MoviePosterSkeleton() {
  return (
    <article className="poster-card home-card-skeleton" aria-hidden="true">
      <div className="home-card-skeleton__poster" />
      <div className="home-card-skeleton__meta">
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

function hasHeroContent(hero) {
  if (!hero) {
    return false;
  }

  if (hero.mode === "video") {
    return Boolean(hero.video?.movie);
  }

  return Boolean(hero.carousel?.slides?.length);
}

export default Home;
