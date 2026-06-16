import { genreMovies, genres } from "./genreData";
import { genreRows, trendingMovies } from "./homeData";
import { languageRows } from "./languageData";
import { librarySearchIndex } from "./libraryData";

const pageLabels = {
  all: {
    title: "All Movies",
    breadcrumb: ["home", "movies"],
  },
  trending: {
    title: "Trending",
    breadcrumb: ["home", "movies", "trending"],
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

const genreTitleById = genres.reduce((genreMap, genre) => {
  genreMap[genre.id] = genre.title;
  return genreMap;
}, {});

const movies = buildAllMovies();

export const allMovies = movies;

export function getMoviesPageConfig(searchParams) {
  const section = searchParams.get("section");
  const genreId = searchParams.get("genre");
  const languageId = searchParams.get("language");

  if (languageId) {
    const language = languageRows.find((item) => item.id === languageId);

    return {
      breadcrumb: ["home", "language", language?.title || languageId],
      filter: { type: "language", value: languageId },
      title: language ? `${language.title} Movies` : "Language Movies",
    };
  }

  if (genreId) {
    const genreTitle = genreTitleById[genreId];

    return {
      breadcrumb: ["home", "genre", genreTitle || genreId],
      filter: { type: "genre", value: genreId },
      title: genreTitle ? `${genreTitle} Movies` : "Genre Movies",
    };
  }

  if (section === "trending") {
    return {
      ...pageLabels.trending,
      filter: { type: "section", value: "trending" },
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
    ...Object.entries(genreMovies).flatMap(([genreId, rowMovies]) =>
      rowMovies.map((movie, index) =>
        normalizeMovie(movie, {
          genre: genreTitleById[genreId],
          genreId,
          order: index + 80,
          sections: [genreId],
          source: "genre",
        }),
      ),
    ),
    ...languageRows.flatMap((language) =>
      language.movies.map((movie, index) =>
        normalizeMovie(movie, {
          genre: movie.genre || language.title,
          language: language.title,
          languageId: language.id,
          order: index + 160,
          sections: [language.id],
          source: "language",
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

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}
