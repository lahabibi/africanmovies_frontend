import { useMemo } from "react";
import { AlertCircle, RefreshCw, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import ContentRow from "../components/movie/ContentRow";
import MoviePosterCard from "../components/movie/MoviePosterCard";
import { useLanguages, useMoviesByCategory } from "../hooks/useCatalog";

const LANGUAGE_MOVIE_LIMIT = 100;
const LANGUAGE_ROW_SKELETON_COUNT = 4;
const MOVIE_CARD_SKELETON_COUNT = 8;

function Languages() {
  const { languageSlug } = useParams();
  const {
    data: apiLanguages = [],
    isError,
    isLoading,
    refetch,
  } = useLanguages();
  const languages = useMemo(
    () => getUniqueLanguages(apiLanguages),
    [apiLanguages],
  );
  const selectedLanguage = languages.find(
    (language) => language.id === languageSlug,
  );
  const isAllLanguages = !languageSlug;
  const visibleLanguages = isAllLanguages
    ? languages
    : selectedLanguage
      ? [selectedLanguage]
      : [];

  return (
    <AppShell>
      <main className="languages-page">
        <section
          className="languages-page__hero"
          aria-labelledby="languages-title"
        >
          <h1 id="languages-title">
            {selectedLanguage
              ? selectedLanguage.title
              : languageSlug && !isLoading
                ? "Language Not Found"
                : "Languages"}
          </h1>
          {isAllLanguages ? (
            <p>Explore movies by the language they were made in.</p>
          ) : null}
        </section>

        <div className="language-row-list">
          {isLoading ? <LanguageRowsSkeleton /> : null}

          {isError ? (
            <LanguagesState
              message="We could not load languages right now."
              onRetry={refetch}
              title="Something went wrong"
              variant="error"
            />
          ) : null}

          {!isLoading && !isError && languageSlug && !selectedLanguage ? (
            <LanguagesState
              actionLabel="Browse all languages"
              actionTo="/languages"
              message="Choose another language or go back to all languages."
              title="Language not found"
            />
          ) : null}

          {!isLoading && !isError && isAllLanguages && !languages.length ? (
            <LanguagesState
              message="Languages will appear here once they are available."
              title="No languages to show"
            />
          ) : null}

          {!isLoading && !isError
            ? visibleLanguages.map((language) => (
                <LanguageMovieRow key={language.id} language={language} />
              ))
            : null}
        </div>
      </main>
      <Footer />
    </AppShell>
  );
}

function LanguageMovieRow({ language }) {
  const {
    data: movies = [],
    isError,
    isLoading,
    refetch,
  } = useMoviesByCategory("language", language.title);
  const visibleMovies = movies.slice(0, LANGUAGE_MOVIE_LIMIT);
  const viewAllTo = `/movies?language=${encodeURIComponent(language.title)}`;

  if (isLoading) {
    return <LanguageRowSkeleton title={language.title} />;
  }

  if (isError) {
    return (
      <LanguageRowState
        message={`We could not load ${language.title} movies right now.`}
        onRetry={refetch}
        title={language.title}
        variant="error"
      />
    );
  }

  if (!movies.length) {
    return null;
  }

  return (
    <ContentRow title={language.title} viewAllTo={viewAllTo}>
      {visibleMovies.map((movie) => (
        <MoviePosterCard
          captionMetaItems={[movie.year, movie.duration].filter(Boolean)}
          key={movie.id}
          movie={movie}
          showTitle
        />
      ))}
    </ContentRow>
  );
}

function LanguageRowsSkeleton() {
  return Array.from({ length: LANGUAGE_ROW_SKELETON_COUNT }).map((_, index) => (
    <LanguageRowSkeleton key={index} />
  ));
}

function LanguageRowSkeleton({ title }) {
  const titleId = title
    ? `${title.replace(/\s+/g, "-").toLowerCase()}-loading-title`
    : undefined;

  return (
    <section
      className="content-row language-row-skeleton"
      aria-busy="true"
      aria-labelledby={titleId}
    >
      <div className="content-row__header">
        {title ? (
          <h2 id={titleId}>{title}</h2>
        ) : (
          <span className="language-row-skeleton__title" />
        )}
      </div>
      <div className="content-row__scroller">
        {Array.from({ length: MOVIE_CARD_SKELETON_COUNT }).map((_, index) => (
          <article
            className="poster-card language-card-skeleton"
            aria-hidden="true"
            key={index}
          >
            <span className="language-card-skeleton__poster" />
            <span className="language-card-skeleton__title" />
            <span className="language-card-skeleton__meta" />
          </article>
        ))}
      </div>
    </section>
  );
}

function LanguageRowState({ message, onRetry, title, variant = "empty" }) {
  const titleId = `${title.replace(/\s+/g, "-").toLowerCase()}-state-title`;

  return (
    <section className="content-row" aria-labelledby={titleId}>
      <div className="content-row__header">
        <h2 id={titleId}>{title}</h2>
      </div>
      <LanguagesState
        compact
        message={message}
        onRetry={onRetry}
        title={variant === "error" ? "Something went wrong" : "No movies yet"}
        variant={variant}
      />
    </section>
  );
}

function LanguagesState({
  actionLabel,
  actionTo,
  compact = false,
  message,
  onRetry,
  title,
  variant = "empty",
}) {
  const StateIcon = variant === "error" ? AlertCircle : SearchX;

  return (
    <section
      className={[
        "languages-state",
        `languages-state--${variant}`,
        compact ? "languages-state--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={variant === "error" ? "alert" : undefined}
    >
      <span className="languages-state__icon">
        <StateIcon aria-hidden="true" size={25} strokeWidth={1.8} />
      </span>
      <strong>{title}</strong>
      <p>{message}</p>
      {onRetry ? (
        <button onClick={() => onRetry()} type="button">
          <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
          Try Again
        </button>
      ) : null}
      {actionTo && actionLabel ? (
        <Link to={actionTo}>{actionLabel}</Link>
      ) : null}
    </section>
  );
}

function getUniqueLanguages(languages) {
  const languageMap = new Map();

  languages.forEach((language) => {
    if (!languageMap.has(language.id)) {
      languageMap.set(language.id, language);
    }
  });

  return Array.from(languageMap.values()).sort((firstLanguage, secondLanguage) =>
    firstLanguage.title.localeCompare(secondLanguage.title, undefined, {
      sensitivity: "base",
    }),
  );
}

export default Languages;
