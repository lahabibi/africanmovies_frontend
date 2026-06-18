const DEFAULT_PRICE = 0.99;
const DEFAULT_MATURITY_RATING = "16+";
const CONTINUE_WATCHING_EXPIRING_SOON_MS = 3 * 24 * 60 * 60 * 1000;

export function mapMovie(rawMovie = {}) {
  const id = String(rawMovie._id || rawMovie.id || rawMovie.slug || "");
  const title = rawMovie.title || "Untitled";
  const poster = rawMovie.moviePictureURL || rawMovie.poster || rawMovie.banner;
  const banner = rawMovie.movieBannerPictureURL || rawMovie.banner || poster;
  const genre = rawMovie.genre || "Drama";
  const language = rawMovie.language || "English";

  return {
    id,
    backendId: id,
    slug: id || slugify(title),
    title,
    poster,
    banner,
    thumbnail: banner || poster,
    genre,
    genres: Array.isArray(rawMovie.genres) ? rawMovie.genres : [genre],
    language,
    languages: Array.isArray(rawMovie.languages)
      ? rawMovie.languages
      : [language].filter(Boolean),
    countryName: rawMovie.countryName,
    description: rawMovie.description || "",
    synopsis: rawMovie.description || "",
    duration: formatDuration(rawMovie.duration),
    durationMinutes: toNumber(rawMovie.duration),
    maturityRating: formatMaturityRating(rawMovie.rating),
    rating: resolveDisplayScore(rawMovie),
    year: rawMovie.releaseYear || rawMovie.year || "",
    releaseType: rawMovie.releaseType || "Featured",
    price: toNumber(rawMovie.price, DEFAULT_PRICE),
    isBanner: Boolean(rawMovie.isBanner),
    isFree: Boolean(rawMovie.isFree),
    status: rawMovie.status,
    trailerUrl: rawMovie.movieTrailerURL || rawMovie.trailerUrl,
    videoUrl: rawMovie.movieVideoURL || rawMovie.videoUrl,
    videoId: rawMovie.videoId,
    cast: Array.isArray(rawMovie.actor) ? rawMovie.actor : [],
    tags: [genre, language, rawMovie.countryName].filter(Boolean),
    raw: rawMovie,
  };
}

export function mapGenre(rawGenre = {}) {
  const title = rawGenre.name || rawGenre.title || "Genre";

  return {
    id: slugify(title),
    backendId: rawGenre._id || rawGenre.id,
    title,
    name: title,
    description:
      rawGenre.description && rawGenre.description !== "None"
        ? rawGenre.description
        : "",
    image: rawGenre.genrePictureURL,
    icon: rawGenre.genreIconURL,
    position: toNumber(rawGenre.positionOnDashboard, 0),
    raw: rawGenre,
  };
}

export function mapLanguage(rawLanguage = {}) {
  const title = rawLanguage.language || rawLanguage.title || "Language";

  return {
    id: slugify(title),
    backendId: rawLanguage._id || rawLanguage.id,
    title,
    language: title,
    countryName: rawLanguage.countryName,
    raw: rawLanguage,
  };
}

export function mapMovieDetails(rawDetails = {}) {
  const movie = mapMovie(rawDetails.movie || rawDetails);
  const relatedMovies = (rawDetails.relatedMovies || []).map(mapMovie);

  return {
    movie: {
      ...movie,
      about: {
        cast: movie.cast.length ? movie.cast.join(", ") : "AfricanMovies Cast",
        language: movie.language,
        audio: "Stereo",
        releaseYear: movie.year,
        production: movie.countryName || "AfricanMovies",
      },
      heroMovie: {
        mode: movie.videoUrl ? "video" : "image",
        banner: movie.banner,
        poster: movie.banner,
        videoSrc: movie.videoUrl,
      },
      moreLikeThis: relatedMovies,
      stats: {
        likes: "0",
        watchlist: "0",
      },
    },
    longevity: rawDetails.longevity || null,
    relatedMovies,
  };
}

export function mapHomeData(rawHome = {}) {
  const movies = (rawHome.movies || []).map(mapMovie);
  const genres = (rawHome.genres || []).map(mapGenre);
  const orders = rawHome.orders || [];
  const bannerMovies = movies.filter((movie) => movie.isBanner);
  const heroSlides = (bannerMovies.length ? bannerMovies : movies).slice(0, 5);
  const homeHero = buildHomeHero(heroSlides, rawHome.longevity);
  const accessByMovieId = buildAccessByMovieId(orders, movies);
  const moviesWithAccess = movies.map((movie) => ({
    ...movie,
    access: accessByMovieId.get(movie.id) || null,
  }));

  return {
    movies: moviesWithAccess,
    genres,
    homeHero,
    continueWatching: buildContinueWatching(orders, movies),
    trendingMovies: moviesWithAccess.slice(0, 12),
    genreRows: buildGenreRows(genres, moviesWithAccess),
    longevity: rawHome.longevity || null,
    orders,
    raw: rawHome,
  };
}

function buildHomeHero(slides, longevity) {
  const normalizedSlides = slides.map((movie) => ({
    ...movie,
    eyebrow: movie.releaseType || "Featured",
    poster: movie.banner || movie.poster,
  }));
  const firstMovie = normalizedSlides[0] || null;
  const mode = longevity?.slidesAsBanner === true ? "carousel" : "video";

  return {
    mode,
    carousel: {
      slides: normalizedSlides,
    },
    video: {
      movie: firstMovie
        ? {
            ...firstMovie,
            videoSrc: firstMovie.videoUrl,
            trailerUrl: firstMovie.trailerUrl,
          }
        : null,
    },
  };
}

function buildGenreRows(genres, movies) {
  return genres
    .map((genre) => {
      const rowMovies = movies
        .filter(
          (movie) =>
            movie.genre &&
            movie.genre.toLowerCase() === genre.title.toLowerCase(),
        )
        .slice(0, 12);

      return {
        id: genre.id,
        title: genre.title,
        movies: rowMovies,
      };
    })
    .filter((row) => row.movies.length > 0);
}

function buildAccessByMovieId(orders, movies) {
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));

  return orders.reduce((accessMap, order) => {
    const movieId = String(order.movieId?._id || order.movieId || "");
    const movie = movieById.get(movieId);
    const access = mapOrderAccess(order, movie);

    if (movieId && access) {
      accessMap.set(movieId, access);
    }

    return accessMap;
  }, new Map());
}

function buildContinueWatching(orders, movies) {
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));

  return orders
    .map((order) => {
      const movieId = String(order.movieId?._id || order.movieId || "");
      const movie = movieById.get(movieId);
      const access = mapOrderAccess(order, movie);

      if (!movie || !access || access.status === "expired") {
        return null;
      }

      const status = getContinueWatchingStatus(order);

      return {
        id: `continue-${movie.id}`,
        slug: movie.slug,
        title: movie.title,
        description: movie.description,
        progress: access.progress,
        purchaseStatus: "paid_active",
        status,
        statusLabel: status === "expiring" ? "Expiring Soon" : "",
        subtitle: access.timeLabel || `${movie.duration} left`,
        thumbnail: movie.thumbnail,
        accessExpiresAt: order.expiryDate,
      };
    })
    .filter(Boolean);
}

function getContinueWatchingStatus(order) {
  const expiryDate = order?.expiryDate ? new Date(order.expiryDate) : null;
  const millisecondsLeft = expiryDate ? expiryDate.getTime() - Date.now() : 0;

  return millisecondsLeft > 0 &&
    millisecondsLeft < CONTINUE_WATCHING_EXPIRING_SOON_MS
    ? "expiring"
    : "active";
}

function mapOrderAccess(order, movie) {
  const expiryDate = order?.expiryDate ? new Date(order.expiryDate) : null;
  const now = new Date();

  if (expiryDate && expiryDate <= now) {
    return {
      progress: 100,
      status: "expired",
      statusLabel: "Expired",
      timeLabel: "Expired",
    };
  }

  const millisecondsLeft = expiryDate ? expiryDate.getTime() - now.getTime() : 0;
  const isExpiringSoon =
    millisecondsLeft > 0 && millisecondsLeft <= 48 * 60 * 60 * 1000;
  const progress = getWatchProgress(order, movie);

  return {
    progress,
    status: isExpiringSoon ? "expiring" : "active",
    statusLabel: isExpiringSoon ? "Expiring Soon" : "Active",
    timeLabel: expiryDate ? `${formatTimeUntil(expiryDate)} left` : "",
  };
}

function getWatchProgress(order, movie) {
  const currentTime = toNumber(order?.currentTime, 0);
  const durationSeconds = (movie?.durationMinutes || 0) * 60;

  if (!currentTime || !durationSeconds) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round((currentTime / durationSeconds) * 100)),
  );
}

function formatTimeUntil(date) {
  const minutesLeft = Math.max(0, Math.round((date.getTime() - Date.now()) / 60000));
  const hours = Math.floor(minutesLeft / 60);
  const minutes = minutesLeft % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  if (hours > 0) {
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function formatDuration(duration) {
  if (typeof duration === "string" && /\d/.test(duration)) {
    const numericDuration = Number(duration);

    if (Number.isNaN(numericDuration)) {
      return duration;
    }
  }

  const totalMinutes = Math.round(toNumber(duration, 0));

  if (!totalMinutes) {
    return "";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatMaturityRating(rating) {
  if (!rating) {
    return DEFAULT_MATURITY_RATING;
  }

  const normalizedRating = String(rating).trim();

  if (normalizedRating.endsWith("+")) {
    return normalizedRating;
  }

  if (/^\d+$/.test(normalizedRating)) {
    return `${normalizedRating}+`;
  }

  return normalizedRating;
}

function resolveDisplayScore(movie) {
  const explicitScore = toNumber(
    movie.displayRating || movie.averageRating || movie.score,
    null,
  );

  if (explicitScore) {
    return explicitScore;
  }

  const source = String(movie._id || movie.title || "");
  const hash = source
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return Number((7.2 + (hash % 16) / 10).toFixed(1));
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
