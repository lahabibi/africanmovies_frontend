import { normalizeSiteMode } from "./siteMode";

test("normalizes supported site modes and rejects unknown values", () => {
  expect(normalizeSiteMode("COMING-SOON")).toBe("coming-soon");
  expect(normalizeSiteMode(" maintenance ")).toBe("maintenance");
  expect(normalizeSiteMode("anything-else")).toBe("app");
});
