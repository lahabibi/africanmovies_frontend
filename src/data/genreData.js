import actionIcon from "../assets/icons/ic_action.png";
import comedyIcon from "../assets/icons/ic_comedy.png";
import dramaIcon from "../assets/icons/ic_drama.png";
import familyIcon from "../assets/icons/ic_family.png";
import horrorIcon from "../assets/icons/ic_horror.png";
import romanceIcon from "../assets/icons/ic_romance.png";
import thrillerIcon from "../assets/icons/ic_thriller.png";
import actionImage from "../assets/images/img_genre_action.png";
import comedyImage from "../assets/images/img_genre_comedy.png";
import dramaImage from "../assets/images/img_genre_drama.png";
import familyImage from "../assets/images/img_genre_family.png";
import horrorImage from "../assets/images/img_genre_horror.png";
import romanceImage from "../assets/images/img_genre_romance.png";
import poster1 from "../assets/images/img_poster1.png";
import poster2 from "../assets/images/img_poster2.png";
import poster3 from "../assets/images/img_poster3.png";
import poster4 from "../assets/images/img_poster4.png";
import poster5 from "../assets/images/img_poster5.png";
import poster6 from "../assets/images/img_poster6.png";
import poster7 from "../assets/images/img_poster7.png";
import poster8 from "../assets/images/img_poster8.png";
import poster9 from "../assets/images/img_poster9.png";
import poster10 from "../assets/images/img_poster10.png";
import poster11 from "../assets/images/img_poster11.png";
import poster12 from "../assets/images/img_poster12.png";
import poster13 from "../assets/images/img_poster13.png";
import poster14 from "../assets/images/img_poster14.png";
import poster15 from "../assets/images/img_poster15.png";
import poster16 from "../assets/images/img_poster16.png";
import poster17 from "../assets/images/img_poster17.png";
import poster18 from "../assets/images/img_poster18.png";
import poster19 from "../assets/images/img_poster19.png";
import poster20 from "../assets/images/img_poster20.png";

const defaultMovie = {
  maturityRating: "16+",
  purchaseStatus: "not_purchased",
  price: 0.99,
  currency: "USD",
};

export const genres = [
  {
    id: "action",
    title: "Action",
    description: "High-octane stories that keep you on the edge.",
    detailDescription:
      "Explosive stories, bold heroes, and impossible choices.",
    image: actionImage,
    icon: actionIcon,
    count: 312,
  },
  {
    id: "drama",
    title: "Drama",
    description: "Real stories that reflect life, emotions and truth.",
    detailDescription:
      "Real stories, family wounds, and powerful performances.",
    image: dramaImage,
    icon: dramaIcon,
    count: 642,
  },
  {
    id: "comedy",
    title: "Comedy",
    description: "Laughter, fun and good vibes all the way.",
    detailDescription: "Laughter, fun and good vibes all the way.",
    image: comedyImage,
    icon: comedyIcon,
    count: 278,
  },
  {
    id: "romance",
    title: "Romance",
    description: "Love stories that touch the heart.",
    detailDescription: "Love, longing, and the choices that change everything.",
    image: romanceImage,
    icon: romanceIcon,
    count: 193,
  },
  {
    id: "thriller",
    title: "Thriller",
    description: "Suspenseful stories that keep you guessing.",
    detailDescription: "Secrets, danger, and a countdown you can feel.",
    image: actionImage,
    icon: thrillerIcon,
    count: 186,
  },
  {
    id: "horror",
    title: "Horror",
    description: "Dark, eerie and unforgettable.",
    detailDescription: "Dark, eerie and unforgettable stories after midnight.",
    image: horrorImage,
    icon: horrorIcon,
    count: 92,
  },
  {
    id: "family",
    title: "Family",
    description: "Warm stories for everyone at home.",
    detailDescription: "Heartfelt stories made for shared family nights.",
    image: familyImage,
    icon: familyIcon,
    count: 211,
  },
];

export const genreFilters = [
  { id: "all", title: "All Genres", to: "/genres" },
  ...genres.map((genre) => ({
    id: genre.id,
    title: genre.title,
    to: `/genres/${genre.id}`,
  })),
];

export const genreMovies = {
  action: [
    movie("shakara", "Shakara", poster1, 8.5, "2026", "2h 14m"),
    movie("gangs-of-lagos", "Gangs of Lagos", poster4, 8.1, "2023", "2h 05m"),
    movie("the-black-book", "The Black Book", poster15, 7.8, "2024", "1h 53m"),
    movie("king-of-boys", "King of Boys", poster6, 8.7, "2021", "2h 13m"),
    movie("seventy-six", "76", poster13, 8.3, "2016", "1h 58m"),
    movie(
      "battle-on-buka-street",
      "Battle on Buka Street",
      poster5,
      8.2,
      "2022",
      "2h 00m",
    ),
    movie("blood-sisters", "Blood Sisters", poster18, 7.6, "2022", "1h 47m"),
    movie("the-bridge", "The Bridge", poster12, 7.9, "2021", "1h 44m"),
    movie("city-heat", "City Heat", poster7, 7.8, "2025", "1h 39m"),
    movie("lagos-code", "Lagos Code", poster10, 8.0, "2024", "1h 52m"),
    movie("silent-target", "Silent Target", poster11, 7.5, "2023", "1h 48m"),
    movie("borderline", "Borderline", poster16, 7.7, "2022", "2h 04m"),
  ],
  drama: [
    movie("mothers-love", "Mothers Love", poster2, 8.7, "2024", "2h 23m"),
    movie("lionheart", "Lionheart", poster1, 8.4, "2024", "2h 07m"),
    movie(
      "half-of-a-yellow-sun",
      "Half of a Yellow Sun",
      poster8,
      8.6,
      "2024",
      "2h 22m",
    ),
    movie(
      "beyond-the-river",
      "Beyond the River",
      poster15,
      8.4,
      "2024",
      "2h 22m",
    ),
    movie("fathers-house", "Father's House", poster16, 8.1, "2024", "1h 32m"),
    movie(
      "the-last-letter",
      "The Last Letter",
      poster17,
      8.3,
      "2024",
      "2h 22m",
    ),
    movie("broken-bridges", "Broken Bridges", poster18, 7.9, "2024", "2h 22m"),
    movie(
      "queen-of-ikorodu",
      "Queen of Ikorodu",
      poster19,
      8.2,
      "2024",
      "2h 54m",
    ),
    movie("before-dawn", "Before Dawn", poster20, 8.0, "2024", "2h 22m"),
    movie("agyu-nyanyi", "Agyu Nyanyi", poster4, 8.0, "2025", "1h 55m"),
  ],
  comedy: [
    movie(
      "alakada-reloaded",
      "Alakada Reloaded",
      poster9,
      8.2,
      "2023",
      "1h 53m",
    ),
    movie("chief-daddy", "Chief Daddy", poster10, 7.6, "2018", "1h 40m"),
    movie("merry-men", "Merry Men", poster7, 7.8, "2019", "1h 55m"),
    movie(
      "millionaires-club",
      "The Millionaire's Club",
      poster11,
      8.1,
      "2016",
      "1h 47m",
    ),
    movie("small-chops", "Small Chops", poster14, 7.4, "2018", "1h 41m"),
    series(
      "jenifas-diary",
      "Jenifa's Diary",
      poster18,
      8.3,
      "S1 • 12 Episodes",
    ),
    movie("house-party", "House Party", poster19, 7.0, "2013", "1h 37m"),
    movie(
      "a-trip-to-jamaica",
      "A Trip to Jamaica",
      poster4,
      7.5,
      "2016",
      "1h 36m",
    ),
    movie(
      "30-days-in-atlanta",
      "30 Days in Atlanta",
      poster13,
      7.2,
      "2014",
      "1h 40m",
    ),
    movie(
      "the-wedding-party",
      "The Wedding Party",
      poster3,
      7.9,
      "2016",
      "1h 45m",
    ),
    movie("oga-boss", "Oga Boss", poster6, 7.3, "2019", "1h 39m"),
    series(
      "funke-akindele-bellos-diary",
      "Funke Akindele Bello's Diary",
      poster20,
      8.0,
      "S1 • 13 Episodes",
    ),
  ],
  romance: [
    movie("sunset-vows", "Sunset Vows", poster3, 8.2, "2026", "1h 58m"),
    movie("love-in-lagos", "Love in Lagos", poster14, 7.9, "2024", "1h 52m"),
    movie(
      "the-wedding-party",
      "The Wedding Party",
      poster3,
      7.9,
      "2016",
      "1h 45m",
    ),
    movie(
      "flavours-of-the-heart",
      "Flavours of the Heart",
      poster2,
      8.0,
      "2025",
      "1h 11m",
    ),
    movie("almost-perfect", "Almost Perfect", poster8, 7.2, "2024", "1h 34m"),
    movie("yellow-sun", "Yellow Sun", poster11, 7.8, "2024", "1h 46m"),
  ],
  thriller: [
    movie("the-black-book", "The Black Book", poster15, 7.8, "2024", "1h 53m"),
    movie("blood-sisters", "Blood Sisters", poster18, 7.6, "2022", "1h 47m"),
    movie("shadow-road", "Shadow Road", poster4, 7.1, "2024", "1h 09m"),
    movie("night-market", "Night Market", poster17, 7.5, "2022", "1h 52m"),
    movie("true-trade", "True Trade", poster11, 8.3, "2024", "2h 42m"),
    movie("river-oath", "River Oath", poster16, 7.9, "2025", "1h 58m"),
  ],
  horror: [
    movie("shadow-road", "Shadow Road", poster4, 7.1, "2024", "1h 09m"),
    movie("night-market", "Night Market", poster18, 7.5, "2022", "1h 52m"),
    movie(
      "the-whispering-room",
      "The Whispering Room",
      poster13,
      7.3,
      "2026",
      "2h 33m",
    ),
    movie(
      "blood-moon-lagos",
      "Blood Moon Lagos",
      poster9,
      7.7,
      "2021",
      "2h 02m",
    ),
    movie("spirit-house", "Spirit House", poster16, 7.6, "2024", "2h 22m"),
    movie("the-last-ritual", "The Last Ritual", poster6, 7.4, "2021", "2h 55m"),
    movie("ibu-at-paris", "Mr Ibu in Paris", poster19, 7.4, "2021", "2h 55m"),
    movie("mr-ibu-wedding", "Mr Ibu Wedding", poster20, 7.4, "2021", "2h 55m"),
  ],
  epic: [
    movie(
      "royal-crossroads",
      "Royal Crossroads",
      poster6,
      8.7,
      "2025",
      "2h 07m",
    ),
    movie("lisabi", "Lisabi", poster2, 8.7, "2024", "2h 23m"),
    movie("king-of-boys", "King of Boys", poster6, 8.7, "2021", "2h 13m"),
    movie(
      "a-tribe-called-judah",
      "A Tribe Called Judah",
      poster5,
      8.2,
      "2024",
      "2h 44m",
    ),
    movie("the-bridge", "The Bridge", poster12, 7.9, "2021", "1h 44m"),
    movie("yellow-sun", "Yellow Sun", poster8, 8.6, "2024", "2h 22m"),
  ],
  documentary: [
    movie("real-lagos", "Real Lagos", poster12, 7.9, "2025", "1h 38m"),
    movie("market-day", "Market Day", poster4, 7.2, "2024", "2h 43m"),
    movie(
      "the-river-keepers",
      "The River Keepers",
      poster15,
      8.0,
      "2024",
      "1h 49m",
    ),
    movie("sounds-of-home", "Sounds of Home", poster17, 7.7, "2023", "1h 33m"),
    movie("city-makers", "City Makers", poster10, 7.6, "2022", "1h 41m"),
    movie("savanna-light", "Savanna Light", poster16, 8.1, "2024", "1h 57m"),
  ],
  family: [
    movie("family-wahala", "Family Wahala", poster11, 8.0, "2025", "1h 59m"),
    movie("small-chops", "Small Chops", poster14, 7.4, "2018", "1h 41m"),
    movie("mothers-love", "Mothers Love", poster2, 8.7, "2024", "2h 23m"),
    movie("house-party", "House Party", poster19, 7.0, "2013", "1h 37m"),
    movie(
      "mr-ibu-and-kezia",
      "Mr Ibu and Kezia",
      poster18,
      7.2,
      "2024",
      "1h 22m",
    ),
    movie("before-dawn", "Before Dawn", poster20, 8.0, "2024", "2h 22m"),
  ],
};

function movie(slug, title, poster, rating, year, duration) {
  return {
    id: `genre-movie-${slug}`,
    slug,
    title,
    poster,
    rating,
    year,
    duration,
    ...defaultMovie,
  };
}

function series(slug, title, poster, rating, episodeLabel) {
  return {
    ...movie(slug, title, poster, rating, null, episodeLabel),
    type: "series",
    maturityRating: "13+",
  };
}
