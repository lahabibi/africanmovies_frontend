import { trendingMovies } from "./homeData";

function savedMovie(movie, savedAt) {
  return { ...movie, savedAt };
}

export const savedMovieCollections = {
  favorites: [
    savedMovie(trendingMovies[0], "2026-06-20T18:30:00Z"),
    savedMovie(trendingMovies[2], "2026-06-18T12:15:00Z"),
    savedMovie(trendingMovies[5], "2026-06-15T09:45:00Z"),
    savedMovie(trendingMovies[7], "2026-06-10T20:10:00Z"),
    savedMovie(trendingMovies[1], "2026-06-08T14:25:00Z"),
    savedMovie(trendingMovies[4], "2026-06-04T16:00:00Z"),
    savedMovie(trendingMovies[9], "2026-05-29T11:20:00Z"),
    savedMovie(trendingMovies[6], "2026-05-22T08:40:00Z"),
  ],
  watchlist: [
    savedMovie(trendingMovies[3], "2026-06-21T07:25:00Z"),
    savedMovie(trendingMovies[8], "2026-06-19T17:10:00Z"),
    savedMovie(trendingMovies[10], "2026-06-16T13:35:00Z"),
    savedMovie(trendingMovies[4], "2026-06-12T21:05:00Z"),
    savedMovie(trendingMovies[7], "2026-06-07T10:30:00Z"),
    savedMovie(trendingMovies[2], "2026-06-02T15:50:00Z"),
  ],
};
