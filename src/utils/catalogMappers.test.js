import { buildActiveMovieAccessMap } from "./catalogMappers";

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
