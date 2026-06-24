const supportedSiteModes = new Set(["app", "coming-soon", "maintenance"]);

export function normalizeSiteMode(mode) {
  const normalizedMode = String(mode || "app")
    .trim()
    .toLowerCase();

  return supportedSiteModes.has(normalizedMode) ? normalizedMode : "app";
}

export const SITE_MODE = normalizeSiteMode(process.env.REACT_APP_SITE_MODE);
export const IS_HOLDING_PAGE = SITE_MODE !== "app";
