import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import { useLibrary } from "../hooks/useOrders";
import Library from "./Library";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../hooks/useOrders", () => ({
  useLibrary: jest.fn(),
}));

jest.mock("../components/layout/AppShell", () =>
  function MockShell({ children }) {
    return <>{children}</>;
  },
);

jest.mock("../components/layout/Footer", () => () => null);

const items = [
  {
    id: "order-bravo",
    movieId: "movie-bravo",
    slug: "movie-bravo",
    title: "Bravo Story",
    image: "bravo.jpg",
    price: 10.99,
    currency: "USD",
    purchasedAt: "2026-06-22T10:00:00.000Z",
    status: "active",
    statusLabel: "Active",
    timeLabel: "Ready to watch",
    progress: 0,
  },
  {
    id: "order-alpha",
    movieId: "movie-alpha",
    slug: "movie-alpha",
    title: "Alpha Story",
    image: "alpha.jpg",
    price: 10.99,
    currency: "USD",
    purchasedAt: "2026-06-21T10:00:00.000Z",
    status: "active",
    statusLabel: "Active",
    timeLabel: "20h left",
    progress: 25,
  },
  {
    id: "order-old",
    movieId: "movie-old",
    slug: "movie-old",
    title: "Old Story",
    image: "old.jpg",
    price: 10.99,
    currency: "USD",
    purchasedAt: "2026-06-20T10:00:00.000Z",
    status: "expired",
    statusLabel: "Expired",
    timeLabel: "Expired 1d ago",
    progress: 0,
  },
];

beforeEach(() => {
  getAuthToken.mockReturnValue("test-token");
  useLibrary.mockReturnValue({
    data: { items },
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
});

test("searches and sorts real library titles", () => {
  const { container } = render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Library />
    </MemoryRouter>,
  );

  expect(
    Array.from(container.querySelectorAll(".library-card__content strong")).map(
      (element) => element.textContent,
    ),
  ).toEqual(["Bravo Story", "Alpha Story", "Old Story"]);

  fireEvent.change(screen.getByLabelText("Sort library"), {
    target: { value: "title" },
  });
  expect(
    Array.from(container.querySelectorAll(".library-card__content strong")).map(
      (element) => element.textContent,
    ),
  ).toEqual(["Alpha Story", "Bravo Story", "Old Story"]);

  fireEvent.change(screen.getByPlaceholderText("Search in my library..."), {
    target: { value: "alpha" },
  });
  expect(screen.getByText("Alpha Story")).toBeInTheDocument();
  expect(screen.queryByText("Bravo Story")).not.toBeInTheDocument();
});

test("routes expired Watch Again through the purchase decision flow", () => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Library />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("link", { name: "Watch Again $10.99" }),
  ).toHaveAttribute("href", "/movies/movie-old?watch=now");
});
