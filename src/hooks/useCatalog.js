import { useQuery } from "@tanstack/react-query";
import {
  getGenre,
  getGenres,
  getHomeData,
  getLanguage,
  getLanguages,
  getMovieDetails,
  getMovieUserData,
  getMovies,
  getMoviesByCategory,
  getTrailerAccess,
  searchMovies,
} from "../api/catalogApi";
import {
  mapGenre,
  mapHomeData,
  mapLanguage,
  mapMovie,
  mapMovieDetails,
} from "../utils/catalogMappers";

export const catalogKeys = {
  all: ["catalog"],
  genres: () => [...catalogKeys.all, "genres"],
  genre: (genreId) => [...catalogKeys.genres(), genreId],
  home: () => [...catalogKeys.all, "home"],
  languages: () => [...catalogKeys.all, "languages"],
  language: (languageId) => [...catalogKeys.languages(), languageId],
  movie: (movieId) => [...catalogKeys.all, "movie", movieId],
  movieUserData: (movieId) => [...catalogKeys.movie(movieId), "userData"],
  movies: () => [...catalogKeys.all, "movies"],
  moviesByCategory: (category, value) => [
    ...catalogKeys.movies(),
    "category",
    category,
    value,
  ],
  search: (query) => [...catalogKeys.all, "search", query],
  trailerAccess: (movieId) => [...catalogKeys.movie(movieId), "trailerAccess"],
};

export function useHomeCatalog() {
  return useQuery({
    queryFn: async () => mapHomeData(await getHomeData()),
    queryKey: catalogKeys.home(),
    staleTime: 3 * 60 * 1000,
  });
}

export function useMovies() {
  return useQuery({
    queryFn: async () => (await getMovies()).map(mapMovie),
    queryKey: catalogKeys.movies(),
  });
}

export function useMovieDetails(movieId) {
  return useQuery({
    enabled: isMongoObjectId(movieId),
    queryFn: async () => mapMovieDetails(await getMovieDetails(movieId)),
    queryKey: catalogKeys.movie(movieId),
  });
}

export function useMovieUserData(movieId, { enabled = true } = {}) {
  return useQuery({
    enabled: isMongoObjectId(movieId) && enabled,
    queryFn: () => getMovieUserData(movieId),
    queryKey: catalogKeys.movieUserData(movieId),
  });
}

export function useMoviesByCategory(category, value) {
  return useQuery({
    enabled: Boolean(category && value),
    queryFn: async () =>
      (await getMoviesByCategory(category, value)).map(mapMovie),
    queryKey: catalogKeys.moviesByCategory(category, value),
  });
}

export function useMovieSearch(query) {
  const normalizedQuery = query.trim();

  return useQuery({
    enabled: normalizedQuery.length > 1,
    queryFn: async () => (await searchMovies(normalizedQuery)).map(mapMovie),
    queryKey: catalogKeys.search(normalizedQuery),
  });
}

export function useTrailerAccess(movieId, { enabled = false } = {}) {
  return useQuery({
    enabled: isMongoObjectId(movieId) && enabled,
    queryFn: () => getTrailerAccess(movieId),
    queryKey: catalogKeys.trailerAccess(movieId),
    staleTime: 0,
  });
}

export function useGenres() {
  return useQuery({
    queryFn: async () => (await getGenres()).map(mapGenre),
    queryKey: catalogKeys.genres(),
  });
}

export function useGenre(genreId) {
  return useQuery({
    enabled: Boolean(genreId),
    queryFn: async () => mapGenre(await getGenre(genreId)),
    queryKey: catalogKeys.genre(genreId),
  });
}

export function useLanguages() {
  return useQuery({
    queryFn: async () => (await getLanguages()).map(mapLanguage),
    queryKey: catalogKeys.languages(),
  });
}

export function useLanguage(languageId) {
  return useQuery({
    enabled: Boolean(languageId),
    queryFn: async () => mapLanguage(await getLanguage(languageId)),
    queryKey: catalogKeys.language(languageId),
  });
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}
