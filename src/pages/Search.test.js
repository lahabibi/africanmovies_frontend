import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search";

const mockUseMovieSearch = jest.fn();

jest.mock("../hooks/useCatalog", () => ({
  useMovieSearch: (query) => mockUseMovieSearch(query),
}));

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

const defaultQueryState = {
  data: [],
  isError: false,
  isFetching: false,
  refetch: jest.fn(),
};

beforeEach(() => {
  jest.useFakeTimers();
  mockUseMovieSearch.mockReturnValue(defaultQueryState);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("shows a search prompt without rendering fake movies", () => {
  renderSearch();

  expect(
    screen.getByRole("heading", { name: "What would you like to watch?" }),
  ).toBeInTheDocument();
  expect(screen.queryAllByTestId("search-movie")).toHaveLength(0);
  expect(mockUseMovieSearch).toHaveBeenCalledWith("");
});

test("debounces the query and renders API results", () => {
  const apiMovie = {
    id: "movie-1",
    title: "Mother's Love",
    year: 2002,
    genre: "Drama",
  };
  mockUseMovieSearch.mockImplementation((query) => ({
    ...defaultQueryState,
    data: query === "Love" ? [apiMovie] : [],
  }));

  renderSearch();
  const input = screen.getByPlaceholderText("Search movies or actors...");

  fireEvent.change(input, { target: { value: "Love" } });
  expect(mockUseMovieSearch).toHaveBeenLastCalledWith("");

  act(() => jest.advanceTimersByTime(350));

  expect(mockUseMovieSearch).toHaveBeenLastCalledWith("Love");
  expect(screen.getByText("Mother's Love")).toBeInTheDocument();
  expect(screen.getByText("1 title")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input).toHaveValue("");
  expect(screen.queryAllByTestId("search-movie")).toHaveLength(0);
});

test("supports URL-backed searches and a no-results state", () => {
  renderSearch("/search?q=Ama%20Mensah");

  expect(screen.getByDisplayValue("Ama Mensah")).toBeInTheDocument();
  expect(mockUseMovieSearch).toHaveBeenCalledWith("Ama Mensah");
  expect(
    screen.getByRole("heading", { name: "No movies found" }),
  ).toBeInTheDocument();
  expect(screen.queryAllByTestId("search-movie")).toHaveLength(0);
});

test("shows loading and error states with retry support", () => {
  const refetch = jest.fn();
  mockUseMovieSearch.mockReturnValue({
    ...defaultQueryState,
    isFetching: true,
  });
  const { rerender } = renderSearch("/search?q=Love");

  expect(
    screen.getByRole("status", { name: "Searching movies" }),
  ).toBeInTheDocument();

  mockUseMovieSearch.mockReturnValue({
    ...defaultQueryState,
    isError: true,
    refetch,
  });
  rerender(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={["/search?q=Love"]}
    >
      <Search />
    </MemoryRouter>,
  );

  expect(screen.getByRole("alert")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
  expect(refetch).toHaveBeenCalledTimes(1);
});
