import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SavedMovies from "./SavedMovies";

jest.mock("../components/account/AccountSidebar", () => ({ activeId }) => (
  <aside data-testid="account-sidebar">{activeId}</aside>
));

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../components/layout/Footer", () => () => <footer />);

jest.mock("../components/movie/MoviePosterCard", () => ({ movie }) => (
  <article data-testid="saved-movie">{movie.title}</article>
));

function renderSavedMovies(collectionType = "favorites") {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <SavedMovies collectionType={collectionType} />
    </MemoryRouter>,
  );
}

test("renders the requested collection and filters by title", () => {
  renderSavedMovies("favorites");

  expect(
    screen.getByRole("heading", { name: "Favorites", level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("saved-movie")).toHaveLength(8);

  fireEvent.change(screen.getByPlaceholderText("Search by title or actor..."), {
    target: { value: "Lionheart" },
  });

  expect(screen.getAllByTestId("saved-movie")).toHaveLength(1);
  expect(screen.getByText("Lionheart")).toBeInTheDocument();
  expect(screen.getByText("1 matching")).toBeInTheDocument();
});

test("removes a movie locally and shows confirmation feedback", () => {
  renderSavedMovies("watchlist");

  expect(screen.getAllByTestId("saved-movie")).toHaveLength(6);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Remove Battle on Buka Street from watchlist",
    }),
  );

  expect(screen.getAllByTestId("saved-movie")).toHaveLength(5);
  expect(screen.getByRole("status")).toHaveTextContent(
    "Movie removed from watchlist",
  );
});
