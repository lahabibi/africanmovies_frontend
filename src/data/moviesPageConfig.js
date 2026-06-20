const pageLabels = {
  all: {
    title: "All Movies",
    breadcrumb: ["home", "movies"],
  },
  newReleases: {
    title: "New Releases",
    breadcrumb: ["home", "movies", "new releases"],
  },
};

export function getMoviesPageConfig(searchParams) {
  const section = searchParams.get("section");
  const genreId = searchParams.get("genre");
  const languageId = searchParams.get("language");

  if (languageId) {
    const languageTitle = formatFilterTitle(languageId);

    return {
      breadcrumb: ["home", "language", languageTitle || languageId],
      filter: { type: "language", value: languageId },
      title: languageTitle ? `${languageTitle} Movies` : "Language Movies",
    };
  }

  if (genreId) {
    const genreTitle = formatFilterTitle(genreId);

    return {
      breadcrumb: ["home", "genre", genreTitle || genreId],
      filter: { type: "genre", value: genreId },
      title: genreTitle ? `${genreTitle} Movies` : "Genre Movies",
    };
  }

  if (section === "new-releases" || section === "trending") {
    return {
      ...pageLabels.newReleases,
      filter: { type: "section", value: "new-releases" },
    };
  }

  return {
    ...pageLabels.all,
    filter: { type: "all", value: "all" },
  };
}

function formatFilterTitle(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .map((word) =>
      word
        ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
        : word,
    )
    .join(" ");
}
