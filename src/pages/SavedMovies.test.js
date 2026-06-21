import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  useRemoveSavedMovie,
  useSavedMovies,
} from "../hooks/useCatalog";
import { useActiveOrders } from "../hooks/useOrders";
import SavedMovies from "./SavedMovies";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../hooks/useCatalog", () => ({
  useRemoveSavedMovie: jest.fn(),
  useSavedMovies: jest.fn(),
}));

jest.mock("../hooks/useOrders", () => ({
  useActiveOrders: jest.fn(),
}));

jest.mock("../components/account/AccountSidebar", () => ({ activeId }) => (
  <aside data-testid="account-sidebar">{activeId}</aside>
));

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../components/layout/Footer", () => () => <footer />);

jest.mock(
  "../components/movie/MoviePosterCard",
  () =>
    ({ access, movie }) => (
      <article data-access={access?.status || "none"} data-testid="saved-movie">
        {movie.title}
      </article>
    ),
);

const favoriteMovies = [
  {
    cast: ["Actor Two"],
    durationMinutes: 120,
    id: "movie-beta",
    savedAt: "2026-06-21T10:00:00.000Z",
    title: "Beta Story",
  },
  {
    cast: ["Search Actor"],
    durationMinutes: 90,
    id: "movie-alpha",
    savedAt: "2026-06-20T10:00:00.000Z",
    title: "Alpha Story",
  },
];

const watchlistMovies = [
  {
    cast: [],
    durationMinutes: 100,
    id: "movie-watchlist",
    savedAt: "2026-06-19T10:00:00.000Z",
    title: "Watchlist Story",
  },
];

const mockRemoveMutate = jest.fn();
const mockRefetch = jest.fn();

function renderSavedMovies(collectionType = "favorites") {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <SavedMovies collectionType={collectionType} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  getAuthToken.mockReturnValue("test-token");
  useSavedMovies.mockImplementation((collectionType) => ({
    data:
      collectionType === "favorites" ? favoriteMovies : watchlistMovies,
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
  }));
  useActiveOrders.mockReturnValue({
    data: [
      {
        currentTime: 1800,
        expiryDate: "2099-06-23T10:00:00.000Z",
        movieId: { _id: "movie-beta" },
      },
    ],
    isError: false,
    isLoading: false,
    refetch: mockRefetch,
  });
  useRemoveSavedMovie.mockReturnValue({
    isPending: false,
    mutate: mockRemoveMutate,
    variables: null,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders API movies with library access and searches by actor", () => {
  renderSavedMovies("favorites");

  expect(
    screen.getByRole("heading", { name: "Favorites", level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("saved-movie")).toHaveLength(2);
  expect(screen.getByText("Beta Story")).toHaveAttribute(
    "data-access",
    "active",
  );

  fireEvent.change(screen.getByPlaceholderText("Search by title or actor..."), {
    target: { value: "Search Actor" },
  });

  expect(screen.getAllByTestId("saved-movie")).toHaveLength(1);
  expect(screen.getByText("Alpha Story")).toBeInTheDocument();
  expect(screen.getByText("1 matching")).toBeInTheDocument();
});

test("sorts recently added by default and supports title A-Z", () => {
  renderSavedMovies("favorites");

  expect(screen.getAllByTestId("saved-movie").map((movie) => movie.textContent)).toEqual([
    "Beta Story",
    "Alpha Story",
  ]);

  fireEvent.change(screen.getByLabelText("Sort favorites"), {
    target: { value: "title" },
  });

  expect(screen.getAllByTestId("saved-movie").map((movie) => movie.textContent)).toEqual([
    "Alpha Story",
    "Beta Story",
  ]);
});

test("removes a saved movie through the API mutation", () => {
  mockRemoveMutate.mockImplementation((movieId, options) => {
    options.onSuccess({ action: "REMOVED" });
  });
  renderSavedMovies("watchlist");

  fireEvent.click(
    screen.getByRole("button", {
      name: "Remove Watchlist Story from watchlist",
    }),
  );

  expect(mockRemoveMutate).toHaveBeenCalledWith(
    "movie-watchlist",
    expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }),
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Movie removed from watchlist",
  );
});
