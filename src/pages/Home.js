import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import FeatureStrip from "../components/home/FeatureStrip";
import ContentRow from "../components/movie/ContentRow";
import ContinueWatchingCard from "../components/movie/ContinueWatchingCard";
import HeroSection from "../components/movie/HeroSection";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useHomeCatalog, useLatestMovies } from "../hooks/useCatalog";
import { serviceHighlights } from "../data/homeData";

const NEW_RELEASES_SKELETON_COUNT = 8;

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

  return (
    <AppShell>
      <main className="home-page">
        {resolvedHero ? (
          <HeroSection hero={resolvedHero} />
        ) : (
          <HomeHeroState
            isLoading={isHomeLoading}
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
          ) : isLatestMoviesLoading ? (
            <ContentRow
              className="content-row--loading"
              title="New Releases"
              viewAllTo="/movies?section=new-releases"
            >
              {Array.from({ length: NEW_RELEASES_SKELETON_COUNT }).map(
                (_, index) => (
                  <MoviePosterSkeleton key={index} />
                ),
              )}
            </ContentRow>
          ) : (
            <HomeRowState
              message={
                isLatestMoviesError
                  ? "We could not load new releases right now."
                  : "New releases will appear here once they are available."
              }
              title="New Releases"
            />
          )}

          <FeatureStrip items={serviceHighlights} />

          {resolvedGenreRows.map((row) => (
            <ContentRow
              key={row.id}
              title={row.title}
              viewAllTo={`/movies?genre=${encodeURIComponent(row.title)}`}
            >
              {row.movies.map((movie) => (
                <MoviePosterCard key={movie.id} movie={movie} />
              ))}
            </ContentRow>
          ))}
        </div>

        <Footer />
      </main>
    </AppShell>
  );
}

function HomeHeroState({ isLoading = false, message, title }) {
  return (
    <section
      className={[
        "hero-banner",
        "hero-banner--state",
        isLoading ? "hero-banner--loading" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={isLoading}
      aria-label="Featured movie"
    >
      <div className="hero-banner__state">
        <span className="hero-banner__state-mark" aria-hidden="true" />
        <p>{isLoading ? "Loading featured movies" : title}</p>
        <h1>{isLoading ? "AfricanMovies" : title}</h1>
        <span>{isLoading ? "Preparing your home banner..." : message}</span>
      </div>
    </section>
  );
}

function HomeRowState({ message, title }) {
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-state-title`;

  return (
    <section className="content-row home-row-state" aria-labelledby={titleId}>
      <div className="content-row__header">
        <h2 id={titleId}>{title}</h2>
      </div>
      <div className="home-empty-state">
        <strong>No movies to show</strong>
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
