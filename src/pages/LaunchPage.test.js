import { render, screen } from "@testing-library/react";
import LaunchPage from "./LaunchPage";

test("introduces the upcoming platform across web and mobile", () => {
  render(<LaunchPage mode="coming-soon" />);

  expect(
    screen.getByRole("heading", { name: "AfricanMovies is coming." }),
  ).toBeInTheDocument();
  expect(screen.getByText("Web")).toBeInTheDocument();
  expect(screen.getByText("iPhone & iPad")).toBeInTheDocument();
  expect(screen.getByText("Android")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /contact africanmovies/i }),
  ).toHaveAttribute("href", "mailto:info@africanmovies.com");
});

test("provides a dedicated maintenance message", () => {
  render(<LaunchPage mode="maintenance" />);

  expect(
    screen.getByRole("heading", {
      name: "We'll be back on screen shortly.",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("Maintenance underway")).toBeInTheDocument();
  expect(
    screen.getByText(/account, purchases and library remain safe/i),
  ).toBeInTheDocument();
});
