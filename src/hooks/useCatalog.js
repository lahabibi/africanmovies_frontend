import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";
import {
  getGenre,
  getGenres,
  getFavoriteMovies,
  getHomeData,
  getLanguage,
  getLanguages,
  getLatestMovies,
  getMovieDetails,
  getMovieUserData,
  getMovies,
  getMoviesByCategory,
  getTrailerAccess,
  getWatchlistMovies,
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
  mapSavedMovie,
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
  savedMovies: (collectionType, ownerKey) => [
    ...catalogKeys.movies(),
    "saved",
    collectionType,
    ...(ownerKey ? [ownerKey] : []),
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

export function useSavedMovies(collectionType) {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey = storedUser?._id || storedUser?.id || "authenticated";

  return useQuery({
    enabled:
      Boolean(token) &&
      (collectionType === "favorites" || collectionType === "watchlist"),
    queryFn: async () => {
      const entries =
        collectionType === "favorites"
          ? await getFavoriteMovies()
          : await getWatchlistMovies();

      return entries.map(mapSavedMovie).filter(Boolean);
    },
    queryKey: catalogKeys.savedMovies(collectionType, ownerKey),
    staleTime: 60 * 1000,
  });
}

export function useRemoveSavedMovie(collectionType) {
  const queryClient = useQueryClient();
  const storedUser = getStoredAuthUser();
  const ownerKey = storedUser?._id || storedUser?.id || "authenticated";

  return useMutation({
    mutationFn: (movieId) =>
      collectionType === "favorites"
        ? toggleMovieFavorite(movieId)
        : toggleMovieWatchlist(movieId),
    onSuccess: (response, movieId) => {
      if (response?.action !== "REMOVED") {
        return;
      }

      queryClient.setQueryData(
        catalogKeys.savedMovies(collectionType, ownerKey),
        (currentMovies = []) =>
          currentMovies.filter((movie) => movie.id !== movieId),
      );
      queryClient.setQueryData(
        catalogKeys.movieUserData(movieId),
        (currentData = {}) => ({
          ...currentData,
          ...(collectionType === "favorites"
            ? { isFavorite: false }
            : { inWatchlist: false }),
        }),
      );
      queryClient.invalidateQueries({
        exact: true,
        queryKey: catalogKeys.movie(movieId),
      });
    },
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
      queryClient.invalidateQueries({
        queryKey: catalogKeys.savedMovies("favorites"),
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
      queryClient.invalidateQueries({
        queryKey: catalogKeys.savedMovies("watchlist"),
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
    queryKey: catalogKeys.search(normalizedQuery.toLowerCase()),
    staleTime: 2 * 60 * 1000,
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
