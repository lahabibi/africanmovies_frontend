import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

function renderHeader(currentUser = null) {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={["/"]}
    >
      <Header currentUser={currentUser} />
    </MemoryRouter>,
  );
}

test("exposes primary navigation through the mobile menu", () => {
  renderHeader();

  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

  const navigation = screen.getByRole("navigation", {
    name: "Mobile primary navigation",
  });
  expect(navigation).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "Movies" })).toHaveLength(2);
  expect(screen.getAllByRole("link", { name: "Genres" })).toHaveLength(2);
  expect(screen.getAllByRole("link", { name: "Languages" })).toHaveLength(2);
});

test("includes My Library for authenticated mobile users", () => {
  renderHeader({ email: "user@example.com", name: "John Doe" });

  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

  expect(screen.getAllByRole("link", { name: "My Library" })).toHaveLength(2);
});

test("closes the mobile menu with Escape", () => {
  renderHeader();
  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

  fireEvent.keyDown(document, { key: "Escape" });

  expect(
    screen.queryByRole("navigation", { name: "Mobile primary navigation" }),
  ).not.toBeInTheDocument();
});
