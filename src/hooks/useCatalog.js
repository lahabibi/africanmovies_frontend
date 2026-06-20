import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../api/authToken";
import {
  getGenre,
  getGenres,
  getHomeData,
  getLanguage,
  getLanguages,
  getLatestMovies,
  getMovieDetails,
  getMovieUserData,
  getMovies,
  getMoviesByCategory,
  getTrailerAccess,
  searchMovies,
  toggleMovieFavorite,
  toggleMovieWatchlist,
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
  home: (authState = "guest") => [...catalogKeys.all, "home", authState],
  latestMovies: (limit) => [...catalogKeys.movies(), "latest", limit],
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
  const authState = getAuthToken() ? "auth" : "guest";

  return useQuery({
    queryFn: async () => mapHomeData(await getHomeData()),
    queryKey: catalogKeys.home(authState),
    staleTime: 3 * 60 * 1000,
  });
}

export function useMovies({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryFn: async () => (await getMovies()).map(mapMovie),
    queryKey: catalogKeys.movies(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLatestMovies(limit = 50, { enabled = true } = {}) {
  return useQuery({
    enabled,
    queryFn: async () => (await getLatestMovies(limit)).map(mapMovie),
    queryKey: catalogKeys.latestMovies(limit),
    staleTime: 2 * 60 * 1000,
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

export function useToggleMovieFavorite(movieId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleMovieFavorite(movieId),
    onSuccess: (response) => {
      queryClient.setQueryData(
        catalogKeys.movieUserData(movieId),
        (currentData = {}) => ({
          ...currentData,
          isFavorite: response?.action === "ADDED",
        }),
      );
      queryClient.invalidateQueries({
        exact: true,
        queryKey: catalogKeys.movie(movieId),
      });
    },
  });
}

export function useToggleMovieWatchlist(movieId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleMovieWatchlist(movieId),
    onSuccess: (response) => {
      queryClient.setQueryData(
        catalogKeys.movieUserData(movieId),
        (currentData = {}) => ({
          ...currentData,
          inWatchlist: response?.action === "ADDED",
        }),
      );
      queryClient.invalidateQueries({
        exact: true,
        queryKey: catalogKeys.movie(movieId),
      });
    },
  });
}

export function useMoviesByCategory(category, value, { enabled = true } = {}) {
  return useQuery({
    enabled: Boolean(category && value) && enabled,
    queryFn: async () =>
      (await getMoviesByCategory(category, value)).map(mapMovie),
    queryKey: catalogKeys.moviesByCategory(category, value),
    staleTime: 2 * 60 * 1000,
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
