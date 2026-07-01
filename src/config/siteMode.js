const supportedSiteModes = new Set(["app", "coming-soon", "maintenance"]);

// Production switch: "app" | "coming-soon" | "maintenance"
export const SITE_MODE_SWITCH = "app";

export function normalizeSiteMode(mode) {
  const normalizedMode = String(mode || "app")
    .trim()
    .toLowerCase();

  return supportedSiteModes.has(normalizedMode) ? normalizedMode : "app";
}

export const SITE_MODE = normalizeSiteMode(
  process.env.REACT_APP_SITE_MODE || SITE_MODE_SWITCH,
);
export const IS_HOLDING_PAGE = SITE_MODE !== "app";
