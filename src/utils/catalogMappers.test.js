import {
  buildActiveMovieAccessMap,
  formatCompactCount,
  mapMovieDetails,
  mapSavedMovie,
} from "./catalogMappers";

describe("formatCompactCount", () => {
  test.each([
    [999, "999"],
    [1000, "1K"],
    [24800, "24.8K"],
    [1200000, "1.2M"],
  ])("formats %s as %s", (value, expected) => {
    expect(formatCompactCount(value)).toBe(expected);
  });
});

describe("mapSavedMovie", () => {
  test("maps a populated saved-movie record and preserves its saved date", () => {
    const movie = mapSavedMovie({
      _id: "saved-entry",
      creationDate: "2026-06-21T10:00:00.000Z",
      movieId: {
        _id: "6a1e54e7be4244a731af7b07",
        actor: ["Actor One"],
        genre: "Drama",
        title: "Saved Story",
      },
    });

    expect(movie).toMatchObject({
      id: "6a1e54e7be4244a731af7b07",
      savedAt: "2026-06-21T10:00:00.000Z",
      savedEntryId: "saved-entry",
      title: "Saved Story",
    });
  });

  test("ignores saved records whose movie was removed", () => {
    expect(mapSavedMovie({ _id: "orphan", movieId: null })).toBeNull();
  });
});

describe("buildActiveMovieAccessMap", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("maps active progress and expiry while excluding expired orders", () => {
    const movies = [
      { id: "movie-active", durationMinutes: 120 },
      { id: "movie-expired", durationMinutes: 90 },
    ];
    const orders = [
      {
        currentTime: 1800,
        expiryDate: "2026-06-22T12:00:00.000Z",
        movieId: { _id: "movie-active" },
      },
      {
        currentTime: 1200,
        expiryDate: "2026-06-19T12:00:00.000Z",
        movieId: { _id: "movie-expired" },
      },
    ];

    const accessByMovieId = buildActiveMovieAccessMap(orders, movies);

    expect(accessByMovieId.get("movie-active")).toEqual({
      progress: 25,
      status: "expiring",
      statusLabel: "Expiring Soon",
      timeLabel: "2d left",
    });
    expect(accessByMovieId.has("movie-expired")).toBe(false);
  });
});

describe("mapMovieDetails hero media", () => {
  const baseMovie = {
    _id: "6a1e54e7be4244a731af7b07",
    actor: [],
    genre: "Drama",
    language: "English",
    moviePictureURL: "poster.jpg",
    movieTrailerURL: "https://iframe.videodelivery.net/trailer-id",
    price: 0.99,
    title: "Movie",
  };

  test("uses the banner picture when one exists", () => {
    const result = mapMovieDetails({
      movie: {
        ...baseMovie,
        movieBannerPictureURL: "banner.jpg",
      },
    });

    expect(result.movie.heroMovie).toMatchObject({
      banner: "banner.jpg",
      mode: "image",
      videoSrc: null,
    });
  });

  test("uses the trailer when there is no banner picture", () => {
    const result = mapMovieDetails({ movie: baseMovie });

    expect(result.movie.heroMovie).toMatchObject({
      banner: undefined,
      mode: "video",
      videoSrc: "https://iframe.videodelivery.net/trailer-id",
    });
  });

  test("maps audience totals and caps related movies at 20", () => {
    const relatedMovies = Array.from({ length: 25 }, (_, index) => ({
      ...baseMovie,
      _id: `related-${index}`,
      title: `Related ${index}`,
    }));
    const result = mapMovieDetails({
      movie: baseMovie,
      relatedMovies,
      stats: { likes: 24800, watchlist: 1200 },
    });

    expect(result.movie.stats).toEqual({ likes: 24800, watchlist: 1200 });
    expect(result.movie.moreLikeThis).toHaveLength(20);
  });

  test("keeps missing optional details empty instead of inventing content", () => {
    const result = mapMovieDetails({
      movie: {
        _id: baseMovie._id,
        actor: [],
        moviePictureURL: "",
        movieTrailerURL: "",
        title: "Sparse Movie",
      },
    });

    expect(result.movie.about).toMatchObject({
      audio: "",
      cast: "",
      production: "",
      releaseYear: "",
    });
    expect(result.movie.tags).toEqual([]);
    expect(result.movie.moreLikeThis).toEqual([]);
  });
});
