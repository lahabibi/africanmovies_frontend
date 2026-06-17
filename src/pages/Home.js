import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import FeatureStrip from "../components/home/FeatureStrip";
import ContentRow from "../components/movie/ContentRow";
import ContinueWatchingCard from "../components/movie/ContinueWatchingCard";
import HeroSection from "../components/movie/HeroSection";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useHomeCatalog } from "../hooks/useCatalog";
import {
  continueWatching,
  genreRows,
  homeHero,
  serviceHighlights,
  trendingMovies,
} from "../data/homeData";

function Home() {
  const { data: homeCatalog } = useHomeCatalog();
  const resolvedHero = homeCatalog?.homeHero?.carousel?.slides?.length
    ? homeCatalog.homeHero
    : homeHero;
  const resolvedContinueWatching =
    homeCatalog?.continueWatching?.length > 0
      ? homeCatalog.continueWatching
      : continueWatching;
  const resolvedTrendingMovies =
    homeCatalog?.trendingMovies?.length > 0
      ? homeCatalog.trendingMovies
      : trendingMovies;
  const resolvedGenreRows =
    homeCatalog?.genreRows?.length > 0 ? homeCatalog.genreRows : genreRows;

  return (
    <AppShell>
      <main className="home-page">
        <HeroSection hero={resolvedHero} />

        <div className="home-page__content">
          <ContentRow title="Continue Watching" viewAllTo="/library">
            {resolvedContinueWatching.map((item) => (
              <ContinueWatchingCard key={item.id} item={item} />
            ))}
          </ContentRow>

          <ContentRow title="Trending" viewAllTo="/movies?section=trending">
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
