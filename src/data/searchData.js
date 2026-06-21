import { genreRows, trendingMovies } from "./homeData";

const castGroups = [
  ["Ama Mensah", "Kwame Boateng", "Esi Owusu"],
  ["Chinedu Okafor", "Adaeze Nwosu", "Tunde Cole"],
  ["Amina Bello", "Ibrahim Musa", "Zainab Garba"],
  ["Kofi Asare", "Nana Yeboah", "Akosua Badu"],
  ["Bisi Adeyemi", "Kunle Afolayan", "Sade Williams"],
];

const languages = ["English", "Yoruba", "Hausa", "French"];
const countries = ["Ghana", "Nigeria", "Senegal"];
const uniqueMovies = new Map();

[...trendingMovies, ...genreRows.flatMap((row) => row.movies)].forEach(
  (movie) => {
    if (!uniqueMovies.has(movie.id)) {
      uniqueMovies.set(movie.id, movie);
    }
  },
);

export const searchMovies = Array.from(uniqueMovies.values())
  .slice(0, 36)
  .map((movie, index) => ({
    ...movie,
    cast: castGroups[index % castGroups.length],
    countryName: countries[index % countries.length],
    description:
      movie.description ||
      "Ambition, family and difficult choices collide in this unforgettable African story.",
    language: languages[index % languages.length],
  }));

export const popularSearches = [
  "Drama",
  "Comedy",
  "Romance",
  "Action",
  "Lagos",
  "Yoruba",
];
