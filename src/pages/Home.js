import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import FeatureStrip from "../components/home/FeatureStrip";
import ContentRow from "../components/movie/ContentRow";
import ContinueWatchingCard from "../components/movie/ContinueWatchingCard";
import HeroSection from "../components/movie/HeroSection";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useHomeCatalog, useLatestMovies } from "../hooks/useCatalog";
import {
  genreRows,
  homeHero,
  serviceHighlights,
  trendingMovies,
} from "../data/homeData";

function Home() {
  const { data: homeCatalog } = useHomeCatalog();
  const { data: latestMovies } = useLatestMovies(50);
  const resolvedHero = homeCatalog?.homeHero?.carousel?.slides?.length
    ? homeCatalog.homeHero
    : homeHero;
  const resolvedContinueWatching = homeCatalog?.continueWatching || [];
  const resolvedTrendingMovies =
    latestMovies?.length > 0
      ? latestMovies
      : trendingMovies;
  const resolvedGenreRows =
    homeCatalog?.genreRows?.length > 0 ? homeCatalog.genreRows : genreRows;

  return (
    <AppShell>
      <main className="home-page">
        <HeroSection hero={resolvedHero} />

        <div className="home-page__content">
          {resolvedContinueWatching.length > 0 ? (
            <ContentRow title="Continue Watching" viewAllTo="/library">
              {resolvedContinueWatching.map((item) => (
                <ContinueWatchingCard key={item.id} item={item} />
              ))}
            </ContentRow>
          ) : null}

          <ContentRow title="New Releases" viewAllTo="/movies?section=new-releases">
            {resolvedTrendingMovies.map((movie) => (
              <MoviePosterCard key={movie.id} movie={movie} />
            ))}
          </ContentRow>

          <FeatureStrip items={serviceHighlights} />

          {resolvedGenreRows.map((row) => (
            <ContentRow
              key={row.id}
              title={row.title}
              viewAllTo={`/movies?genre=${row.id}`}
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

export default Home;
