import { fireEvent, render, screen } from "@testing-library/react";
import PurchaseHistory from "./PurchaseHistory";

jest.mock("../components/layout/AppShell", () =>
  function MockShell({ children }) {
    return <>{children}</>;
  },
);

jest.mock("../components/layout/Footer", () => () => null);
jest.mock("../components/account/AccountSidebar", () => () => null);

test("filters purchase history by payment status and search", () => {
  render(<PurchaseHistory />);

  expect(screen.getByText("King of Boys")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Pending 1" }));

  expect(screen.getByText("Battle on Buka Street")).toBeInTheDocument();
  expect(screen.queryByText("King of Boys")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "All 6" }));
  fireEvent.change(
    screen.getByPlaceholderText("Search movie or reference..."),
    { target: { value: "FREE-3E15B72A" } },
  );

  expect(screen.getByText("Blood Sisters")).toBeInTheDocument();
  expect(screen.queryByText("Battle on Buka Street")).not.toBeInTheDocument();
});

test("sorts titles A-Z and expands transaction details", () => {
  const { container } = render(<PurchaseHistory />);

  fireEvent.change(screen.getByLabelText("Sort purchase history"), {
    target: { value: "title" },
  });

  expect(
    Array.from(container.querySelectorAll(".purchase-history-movie strong")).map(
      (element) => element.textContent,
    ),
  ).toEqual([
    "A Tribe Called Judah",
    "Battle on Buka Street",
    "Blood Sisters",
    "King of Boys",
    "Merry Men 2: Another Mission",
    "The Wedding Party 2",
  ]);

  fireEvent.click(
    screen.getByRole("button", { name: "View details for King of Boys" }),
  );

  expect(screen.getByText("FLW-88310294")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Hide details for King of Boys" }),
  ).toHaveAttribute("aria-expanded", "true");
});
