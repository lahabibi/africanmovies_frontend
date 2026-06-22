import {
  getMovieCardWatchLabel,
  getWatchActionLabel,
} from "./watchActionLabel";

test("shows Watch Free for free movies", () => {
  expect(getWatchActionLabel({ isFree: true, price: 0.99 })).toBe("Watch Free");
});

test("keeps the configured paid label and movie price", () => {
  expect(getWatchActionLabel({ isFree: false, price: 10.99 })).toBe(
    "Watch Now $10.99",
  );
  expect(
    getWatchActionLabel({ isFree: false, price: 10.99 }, "Watch for"),
  ).toBe("Watch for $10.99");
});

test("shows the repurchase price after free access expires", () => {
  expect(
    getWatchActionLabel(
      { isFree: true, price: 0.99 },
      "Watch for",
      {
        action: "PURCHASE",
        reason: "FREE_ACCESS_EXPIRED",
        movie: { price: 0.99 },
      },
    ),
  ).toBe("Watch Now $0.99");
});

test("shows Watch Now when the user already has active access", () => {
  expect(
    getWatchActionLabel(
      { isFree: false, price: 10.99 },
      "Watch for",
      { action: "PLAY" },
    ),
  ).toBe("Watch Now");
});

test("uses free availability for movie card watch labels", () => {
  expect(getMovieCardWatchLabel({ isFree: true })).toBe("Watch Free");
  expect(getMovieCardWatchLabel({ isFree: false })).toBe("Watch Now");
});
