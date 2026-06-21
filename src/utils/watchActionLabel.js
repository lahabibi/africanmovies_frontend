const DEFAULT_MOVIE_PRICE = 0.99;

export function getWatchActionLabel(movie, paidPrefix = "Watch Now") {
  if (movie?.isFree) {
    return "Watch Free";
  }

  const numericPrice = Number(movie?.price);
  const price = Number.isFinite(numericPrice)
    ? numericPrice
    : DEFAULT_MOVIE_PRICE;

  return `${paidPrefix} $${price.toFixed(2)}`;
}
