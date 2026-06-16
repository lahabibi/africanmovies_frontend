import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import FeatureStrip from "../components/home/FeatureStrip";
import ContentRow from "../components/movie/ContentRow";
import ContinueWatchingCard from "../components/movie/ContinueWatchingCard";
import HeroSection from "../components/movie/HeroSection";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import {
  continueWatching,
  genreRows,
  homeHero,
  serviceHighlights,
  trendingMovies,
} from "../data/homeData";

function Home() {
  return (
    <AppShell>
      <main className="home-page">
        <HeroSection hero={homeHero} />

        <div className="home-page__content">
          <ContentRow title="Continue Watching" viewAllTo="/library">
            {continueWatching.map((item) => (
              <ContinueWatchingCard key={item.id} item={item} />
            ))}
          </ContentRow>

          <ContentRow title="Trending" viewAllTo="/movies?section=trending">
            {trendingMovies.map((movie) => (
              <MoviePosterCard key={movie.id} movie={movie} />
            ))}
          </ContentRow>

          <FeatureStrip items={serviceHighlights} />

          {genreRows.map((row) => (
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
