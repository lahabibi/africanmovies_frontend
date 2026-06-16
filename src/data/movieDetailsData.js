import banner1 from "../assets/images/img_banner1.png";
import banner2 from "../assets/images/img_banner2.png";
import banner3 from "../assets/images/img_banner3.png";
import banner4 from "../assets/images/img_banner4.webp";
import banner5 from "../assets/images/img_banner5.png";
import poster1 from "../assets/images/img_poster1.png";
import poster2 from "../assets/images/img_poster2.png";
import poster4 from "../assets/images/img_poster4.png";
import poster5 from "../assets/images/img_poster5.png";
import poster6 from "../assets/images/img_poster6.png";
import poster7 from "../assets/images/img_poster7.png";
import poster9 from "../assets/images/img_poster9.png";
import poster10 from "../assets/images/img_poster10.png";
import poster15 from "../assets/images/img_poster15.png";
import poster18 from "../assets/images/img_poster18.png";
import heroTrailer from "../assets/video/trailer.mp4";

const rental = {
  currency: "USD",
  price: 0.99,
  purchaseStatus: "not_purchased",
};

const relatedMovies = [
  movie("gangs-of-lagos", "Gangs of Lagos", poster4, "2023", "2h 05m", "Action"),
  movie(
    "battle-on-buka-street",
    "Battle on Buka Street",
    poster5,
    "2022",
    "2h 00m",
    "Comedy",
  ),
  movie("river-oath", "River Oath", poster2, "2025", "1h 58m", "Thriller"),
  movie("blood-sisters", "Blood Sisters", poster18, "2022", "1h 47m", "Thriller"),
  movie("tribe-judah", "A Tribe Called Judah", poster10, "2024", "2h 44m", "Drama"),
  movie("king-of-boys", "King of Boys", poster6, "2021", "2h 13m", "Drama"),
  movie("oloture", "Òlòtūré", poster9, "2019", "1h 46m", "Drama"),
  movie("the-black-book", "The Black Book", poster15, "2024", "1h 53m", "Thriller"),
  movie("merry-men", "Merry Men", poster7, "2019", "1h 55m", "Comedy"),
  movie("lionheart", "Lionheart", poster1, "2024", "2h 07m", "Drama"),
];

const detailsBase = {
  maturityRating: "16+",
  quality: "HD",
  stats: {
    likes: "24.8K",
    watchlist: "18.3K",
  },
  tags: ["Nollywood", "Suspenseful", "Dark", "Crime"],
  about: {
    cast: "OC Ukeje, Adesua Etomi, Richard Mofe-Damijo, Wale Ojo and more",
    language: "English, Yoruba",
    audio: "Stereo",
    releaseYear: "2026",
    production: "Nollywood Pictures",
  },
  moreLikeThis: relatedMovies,
  ...rental,
};

export const movieDetailsBySlug = {
  "mothers-love": {
    ...detailsBase,
    id: "movie-detail-mothers-love",
    slug: "mothers-love",
    title: "Mothers Love",
    banner: banner5,
    heroMovie: {
      mode: "video",
      videoSrc: heroTrailer,
      poster: banner5,
    },
    year: "2026",
    genres: ["Drama", "Thriller"],
    duration: "2h 14m",
    rating: 8.5,
    description:
      "A powerful matriarch fights to protect her family when buried secrets threaten the legacy she built.",
    synopsis:
      "After living abroad for many years, a young woman returns to Lagos for her mother's final rites. What starts as a short visit home becomes a dangerous journey as she uncovers buried family secrets, corruption, and a past that someone is willing to kill to protect.",
  },
  shakara: {
    ...detailsBase,
    id: "movie-detail-shakara",
    slug: "shakara",
    title: "Shakara",
    banner: banner2,
    heroMovie: {
      mode: "image",
      banner: banner2,
    },
    year: "2026",
    genres: ["Action", "Thriller"],
    duration: "2h 14m",
    rating: 8.5,
    description:
      "A young man returns to his hometown after years away, only to uncover dark secrets that threaten everything he thought he knew.",
    synopsis:
      "After living abroad for many years, a young man returns to Lagos for his father's burial. What starts as a short visit home becomes a dangerous journey as he uncovers buried family secrets, corruption, and a past that someone is willing to kill to protect.",
  },
  "sunset-vows": {
    ...detailsBase,
    id: "movie-detail-sunset-vows",
    slug: "sunset-vows",
    title: "Sunset Vows",
    banner: banner1,
    heroMovie: {
      mode: "image",
      banner: banner1,
    },
    year: "2026",
    genres: ["Romance", "Drama"],
    duration: "1h 58m",
    rating: 8.2,
    maturityRating: "13+",
    tags: ["Romantic", "Emotional", "Family", "Nollywood"],
    description:
      "Two lovers from different worlds confront family pressure, ambition, and a secret that changes everything.",
    synopsis:
      "A designer and a rising lawyer believe love will be enough, until two families, old promises, and a hidden betrayal put their future in question.",
  },
  "royal-crossroads": {
    ...detailsBase,
    id: "movie-detail-royal-crossroads",
    slug: "royal-crossroads",
    title: "Royal Crossroads",
    banner: banner3,
    heroMovie: {
      mode: "image",
      banner: banner3,
    },
    year: "2025",
    genres: ["Epic", "Drama"],
    duration: "2h 7m",
    rating: 8.7,
    tags: ["Epic", "Royal", "Power", "Legacy"],
    description:
      "A reluctant prince returns home to choose between duty, love, and a kingdom on the edge of change.",
    synopsis:
      "When a king falls ill, an heir who built his life away from the palace must return and face a council divided by ambition, tradition, and old wounds.",
  },
  "battle-on-buka-street": {
    ...detailsBase,
    id: "movie-detail-battle-on-buka-street",
    slug: "battle-on-buka-street",
    title: "Battle on Buka Street",
    banner: banner4,
    heroMovie: {
      mode: "image",
      banner: banner4,
    },
    year: "2023",
    genres: ["Comedy", "Drama"],
    duration: "1h 57m",
    rating: 8.3,
    maturityRating: "13+",
    tags: ["Comedy", "Family", "Food", "Lagos"],
    description:
      "Two rival food families turn one street into a battleground of pride, love, and hilarious chaos.",
    synopsis:
      "When two families compete for the heart of a neighborhood, old grudges and new romances make every meal feel like a declaration of war.",
  },
};

export const defaultMovieDetail = movieDetailsBySlug["mothers-love"];

function movie(slug, title, poster, year, duration, genre) {
  return {
    id: `detail-related-${slug}`,
    slug,
    title,
    poster,
    year,
    duration,
    genre,
    maturityRating: genre === "Comedy" ? "13+" : "16+",
    description:
      "A layered African story filled with ambition, family pressure, and choices that echo long after the credits.",
    ...rental,
  };
}
