import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountSidebar from "./AccountSidebar";

const mockRequestLogout = jest.fn();

jest.mock("../layout/AppShell", () => ({
  useAppShellActions: () => ({ requestLogout: mockRequestLogout }),
}));

afterEach(() => {
  mockRequestLogout.mockClear();
});

test("renders the shared account sidebar in the configured order", () => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AccountSidebar activeId="favorites" />
    </MemoryRouter>,
  );

  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
    "Profile",
    "Payment Details",
    "Purchase History",
    "Devices",
    "My Library",
    "Favorites",
    "Watchlist",
    "Help Center",
    "Contact Us",
  ]);
  expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Devices" })).toHaveAttribute(
    "href",
    "/profile#active-devices",
  );
});

test("delegates logout to the shared app shell flow", () => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AccountSidebar />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Log Out" }));

  expect(mockRequestLogout).toHaveBeenCalledTimes(1);
});
