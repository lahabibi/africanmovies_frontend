import { render, screen } from "@testing-library/react";
import App from "./App";
import AppProviders from "./providers/AppProviders";

test("renders the home page", () => {
  render(
    <AppProviders>
      <App />
    </AppProviders>,
  );
  expect(screen.getAllByAltText(/AfricanMovies/i).length).toBeGreaterThan(0);
  expect(
    screen.getByRole("heading", { level: 2, name: /New Releases/i }),
  ).toBeInTheDocument();
});
