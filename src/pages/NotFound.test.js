import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../components/layout/Footer", () => () => null);

test("offers clear recovery paths from a missing page", () => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <NotFound />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "This page doesn't exist." }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Browse Movies" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "Explore Genres" })).toHaveAttribute(
    "href",
    "/genres",
  );
});
