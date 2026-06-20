import {
  buildActiveMovieAccessMap,
  mapMovieDetails,
} from "./catalogMappers";

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
});
