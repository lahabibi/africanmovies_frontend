const DEFAULT_MOVIE_PRICE = 0.99;

export function getWatchActionLabel(
  movie,
  paidPrefix = "Watch Now",
  accessDecision,
) {
  if (accessDecision?.action === "PLAY") {
    return "Watch Now";
  }

  if (accessDecision?.action === "PURCHASE" && movie?.isFree) {
    return buildPaidLabel(accessDecision.movie || movie, "Watch Now");
  }

  if (movie?.isFree) {
    return "Watch Free";
  }

  return buildPaidLabel(accessDecision?.movie || movie, paidPrefix);
}

export function getMovieCardWatchLabel(movie) {
  return movie?.isFree ? "Watch Free" : "Watch Now";
}

function buildPaidLabel(movie, paidPrefix) {
  const numericPrice = Number(movie?.price);
  const price = Number.isFinite(numericPrice)
    ? numericPrice
    : DEFAULT_MOVIE_PRICE;

  return `${paidPrefix} $${price.toFixed(2)}`;
}
