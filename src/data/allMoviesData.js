import { genreRows, trendingMovies } from "./homeData";
import { librarySearchIndex } from "./libraryData";

const pageLabels = {
  all: {
    title: "All Movies",
    breadcrumb: ["home", "movies"],
  },
  newReleases: {
    title: "New Releases",
    breadcrumb: ["home", "movies", "new releases"],
  },
};

const accessBySlug = librarySearchIndex.reduce((accessMap, item) => {
  accessMap[item.slug] = {
    progress: item.progress,
    status: item.status,
    statusLabel: item.statusLabel,
    timeLabel: item.timeLabel,
  };

  return accessMap;
}, {});

const movies = buildAllMovies();

export const allMovies = movies;

export function getMoviesPageConfig(searchParams) {
  const section = searchParams.get("section");
  const genreId = searchParams.get("genre");
  const languageId = searchParams.get("language");

  if (languageId) {
    const languageTitle = formatFilterTitle(languageId);

    return {
      breadcrumb: ["home", "language", languageTitle || languageId],
      filter: { type: "language", value: languageId },
      title: languageTitle ? `${languageTitle} Movies` : "Language Movies",
    };
  }

  if (genreId) {
    const genreTitle = formatFilterTitle(genreId);

    return {
      breadcrumb: ["home", "genre", genreTitle || genreId],
      filter: { type: "genre", value: genreId },
      title: genreTitle ? `${genreTitle} Movies` : "Genre Movies",
    };
  }

  if (section === "new-releases" || section === "trending") {
    return {
      ...pageLabels.newReleases,
      filter: { type: "section", value: "new-releases" },
    };
  }

  return {
    ...pageLabels.all,
    filter: { type: "all", value: "all" },
  };
}

export function getFilteredMovies(filter) {
  if (filter.type === "genre") {
    return movies.filter((movie) => movie.genreIds.includes(filter.value));
  }

  if (filter.type === "language") {
    return movies.filter((movie) => movie.languageIds.includes(filter.value));
  }

  if (filter.type === "section") {
    if (filter.value === "new-releases") {
      return movies.filter((movie) => movie.sections.includes("trending"));
    }

    return movies.filter((movie) => movie.sections.includes(filter.value));
  }

  return movies;
}

function buildAllMovies() {
  const normalizedMovies = [
    ...trendingMovies.map((movie, index) =>
      normalizeMovie(movie, {
        order: index,
        sections: ["trending"],
        source: "trending",
      }),
    ),
    ...genreRows.flatMap((row) =>
      row.movies.map((movie, index) =>
        normalizeMovie(movie, {
          genre: row.title,
          genreId: row.id,
          order: index + 30,
          sections: [row.id],
          source: "home-genre",
        }),
      ),
    ),
  ];

  return mergeMovies(normalizedMovies);
}

function normalizeMovie(movie, context) {
  const genre = movie.genre || context.genre || "Drama";
  const genreId =
    context.genreId || slugify(movie.genre || context.genre || "drama");
  const access = accessBySlug[movie.slug] || null;

  return {
    id: movie.id || `all-movie-${movie.slug}`,
    slug: movie.slug,
    title: movie.title,
    poster: movie.poster,
    rating: movie.rating || fallbackRating(movie.slug),
    genre,
    duration: movie.duration || "1h 45m",
    maturityRating: movie.maturityRating || "16+",
    year: movie.year || "2024",
    description: movie.description,
    access,
    genreIds: genreId ? [genreId] : [],
    languageIds: context.languageId ? [context.languageId] : [],
    languages: context.language ? [context.language] : [],
    sections: context.sections || [],
    sortOrder: context.order || 0,
    sources: [context.source],
  };
}

function mergeMovies(movieList) {
  const movieMap = new Map();

  movieList.forEach((movie) => {
    if (!movieMap.has(movie.slug)) {
      movieMap.set(movie.slug, movie);
      return;
    }

    const currentMovie = movieMap.get(movie.slug);

    movieMap.set(movie.slug, {
      ...currentMovie,
      ...movie,
      access: currentMovie.access || movie.access,
      description: currentMovie.description || movie.description,
      genre: currentMovie.genre || movie.genre,
      genreIds: unique([...currentMovie.genreIds, ...movie.genreIds]),
      languageIds: unique([...currentMovie.languageIds, ...movie.languageIds]),
      languages: unique([...currentMovie.languages, ...movie.languages]),
      sections: unique([...currentMovie.sections, ...movie.sections]),
      sortOrder: Math.min(currentMovie.sortOrder, movie.sortOrder),
      sources: unique([...currentMovie.sources, ...movie.sources]),
    });
  });

  return Array.from(movieMap.values()).sort(
    (firstMovie, secondMovie) => firstMovie.sortOrder - secondMovie.sortOrder,
  );
}

function fallbackRating(slug) {
  const sum = slug
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return Number((7 + (sum % 18) / 10).toFixed(1));
}

function formatFilterTitle(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .map((word) =>
      word
        ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
        : word,
    )
    .join(" ");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}
