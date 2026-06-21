import { getWatchActionLabel } from "./watchActionLabel";

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
