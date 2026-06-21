import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search";

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../components/layout/Footer", () => () => <footer />);

jest.mock("../components/movie/MoviePosterCard", () => ({ movie }) => (
  <article data-testid="search-movie">{movie.title}</article>
));

function renderSearch(initialEntry = "/search") {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[initialEntry]}
    >
      <Search />
    </MemoryRouter>,
  );
}

test("shows popular titles before a query is entered", () => {
  renderSearch();

  expect(
    screen.getByRole("heading", { name: "Popular Now" }),
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("search-movie")).toHaveLength(12);
  expect(screen.getByText("Popular searches")).toBeInTheDocument();
});

test("filters movies by title and clears the search", async () => {
  renderSearch();
  const input = screen.getByPlaceholderText("Search movies, actors, genres...");

  fireEvent.change(input, { target: { value: "Lionheart" } });

  await waitFor(() =>
    expect(screen.getAllByTestId("search-movie")).toHaveLength(1),
  );
  expect(screen.getByText("Lionheart")).toBeInTheDocument();
  expect(screen.getByText("1 title")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

  await waitFor(() => expect(input).toHaveValue(""));
  expect(screen.getAllByTestId("search-movie")).toHaveLength(12);
});

test("supports URL-backed actor searches and a no-results state", async () => {
  renderSearch("/search?q=Ama%20Mensah");

  expect(screen.getByDisplayValue("Ama Mensah")).toBeInTheDocument();
  expect(screen.getAllByTestId("search-movie").length).toBeGreaterThan(0);

  fireEvent.change(
    screen.getByPlaceholderText("Search movies, actors, genres..."),
    { target: { value: "No Such Movie" } },
  );

  await screen.findByRole("heading", { name: "No movies found" });
  expect(screen.queryAllByTestId("search-movie")).toHaveLength(0);
});

test("runs a suggested search", async () => {
  renderSearch();

  fireEvent.click(screen.getByRole("button", { name: "Comedy" }));

  await waitFor(() =>
    expect(
      screen.getByPlaceholderText("Search movies, actors, genres..."),
    ).toHaveValue("Comedy"),
  );
  expect(screen.getAllByTestId("search-movie").length).toBeGreaterThan(0);
});
