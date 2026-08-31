import { getMoviesPageConfig } from "./moviesPageConfig";

function params(queryString) {
  return new URLSearchParams(queryString);
}

test("maps the free movies section to Free to Watch", () => {
  expect(getMoviesPageConfig(params("section=free"))).toEqual({
    breadcrumb: ["home", "movies", "free to watch"],
    filter: { type: "section", value: "free" },
    title: "Free to Watch",
  });
});
