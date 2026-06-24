import { normalizeSiteMode, SITE_MODE_SWITCH } from "./siteMode";

test("normalizes supported site modes and rejects unknown values", () => {
  expect(normalizeSiteMode("COMING-SOON")).toBe("coming-soon");
  expect(normalizeSiteMode(" maintenance ")).toBe("maintenance");
  expect(normalizeSiteMode("anything-else")).toBe("app");
});

test("keeps the code switch on the full application by default", () => {
  expect(SITE_MODE_SWITCH).toBe("app");
});
