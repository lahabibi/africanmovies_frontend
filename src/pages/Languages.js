import { useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import ContentRow from "../components/movie/ContentRow";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { languageRows } from "../data/languageData";

function Languages() {
  const { languageSlug } = useParams();
  const selectedLanguage = languageRows.find((language) => language.id === languageSlug);
  const visibleRows = selectedLanguage ? [selectedLanguage] : languageRows;

  return (
    <AppShell>
      <main className="languages-page">
        <section className="languages-page__hero" aria-labelledby="languages-title">
          <h1 id="languages-title">
            {selectedLanguage ? selectedLanguage.title : "Languages"}
          </h1>
          {!selectedLanguage ? (
            <p>Explore movies by the language they were made in.</p>
          ) : null}
        </section>

        <div className="language-row-list">
          {visibleRows.map((row) => (
            <ContentRow
              key={row.id}
              title={row.title}
              viewAllTo={`/movies?language=${row.id}`}
            >
              {row.movies.map((movie) => (
                <MoviePosterCard
                  captionMetaItems={[movie.year, movie.duration]}
                  key={movie.id}
                  movie={{
                    ...movie,
                    description: movie.description || row.description,
                    genre: row.title,
                    maturityRating: movie.maturityRating || "16+",
                  }}
                  showTitle
                />
              ))}
            </ContentRow>
          ))}
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}

export default Languages;
