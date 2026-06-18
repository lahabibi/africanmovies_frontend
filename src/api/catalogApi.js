import { apiClient } from "./client";

export function getHomeData() {
  return apiClient("/movies/home/data");
}

export function getMovies() {
  return apiClient("/movies");
}

export function getLatestMovies(limit = 50) {
  return apiClient(`/movies/data/latest?limit=${encodeURIComponent(limit)}`);
}

export function getMovieDetails(movieId) {
  return apiClient(`/movies/movie-details/${movieId}`);
}

export function getMovieUserData(movieId) {
  return apiClient(`/movies/movie-details/${movieId}/user-data`);
}

export function getMoviesByCategory(category, value) {
  return apiClient(
    `/movies/category/${encodeURIComponent(category)}/${encodeURIComponent(
      value,
    )}`,
  );
}

export function searchMovies(query) {
  return apiClient(`/movies/data/search?q=${encodeURIComponent(query)}`);
}

export function getTrailerAccess(movieId) {
  return apiClient(`/movies/trailer/access/${movieId}`);
}

export function getGenres() {
  return apiClient("/genre");
}

export function getGenre(genreId) {
  return apiClient(`/genre/${genreId}`);
}

export function getLanguages() {
  return apiClient("/languages/language");
}

export function getLanguage(languageId) {
  return apiClient(`/languages/language/${languageId}`);
}
