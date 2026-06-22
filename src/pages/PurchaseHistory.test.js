import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import { usePurchaseHistory } from "../hooks/usePayments";
import PurchaseHistory from "./PurchaseHistory";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../hooks/usePayments", () => ({
  usePurchaseHistory: jest.fn(),
}));

jest.mock("../components/layout/AppShell", () =>
  function MockShell({ children }) {
    return <>{children}</>;
  },
);

jest.mock("../components/layout/Footer", () => () => null);
jest.mock("../components/account/AccountSidebar", () => () => null);

const purchaseHistoryItems = [
  {
    id: "history-1",
    txRef: "AM-9F7A2C18",
    createdAt: "2026-06-21T18:42:00.000Z",
    accessStatus: "active",
    movie: { title: "King of Boys", posterUrl: "king.jpg" },
    payment: {
      amount: 10.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Card payment",
      transactionId: "FLW-88310294",
    },
  },
  {
    id: "history-2",
    txRef: "AM-7C3D11B9",
    createdAt: "2026-06-19T09:16:00.000Z",
    accessStatus: "active",
    movie: { title: "The Wedding Party 2", posterUrl: "wedding.jpg" },
    payment: {
      amount: 8.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Saved card",
      transactionId: "FLW-88277410",
    },
  },
  {
    id: "history-3",
    txRef: "AM-4D2E80F6",
    createdAt: "2026-06-17T21:08:00.000Z",
    accessStatus: "pending",
    movie: { title: "Battle on Buka Street", posterUrl: "battle.jpg" },
    payment: {
      amount: 9.99,
      currency: "USD",
      status: "Pending",
      paymentMethod: "Card payment",
      transactionId: null,
    },
  },
  {
    id: "history-4",
    txRef: "AM-1A6C52D3",
    createdAt: "2026-06-14T13:35:00.000Z",
    accessStatus: "expired",
    movie: { title: "A Tribe Called Judah", posterUrl: "tribe.jpg" },
    payment: {
      amount: 7.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Card payment",
      transactionId: "FLW-88192306",
    },
  },
  {
    id: "history-5",
    txRef: "AM-6B8D90A4",
    createdAt: "2026-06-11T16:20:00.000Z",
    accessStatus: "failed",
    movie: { title: "Merry Men 2: Another Mission", posterUrl: "merry.jpg" },
    payment: {
      amount: 10.99,
      currency: "USD",
      status: "Failed",
      paymentMethod: "Card payment",
      transactionId: null,
    },
  },
  {
    id: "history-6",
    txRef: "FREE-3E15B72A",
    createdAt: "2026-06-08T11:05:00.000Z",
    accessStatus: "expired",
    movie: { title: "Blood Sisters", posterUrl: "blood.jpg" },
    payment: null,
  },
];

function renderPurchaseHistory() {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <PurchaseHistory />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  getAuthToken.mockReturnValue("test-token");
  usePurchaseHistory.mockReturnValue({
    data: { items: purchaseHistoryItems },
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
});

test("filters purchase history by payment status and search", () => {
  renderPurchaseHistory();

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

test("expands transaction details", () => {
  renderPurchaseHistory();
  fireEvent.click(
    screen.getByRole("button", { name: "View details for King of Boys" }),
  );

  expect(screen.getByText("FLW-88310294")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Hide details for King of Boys" }),
  ).toHaveAttribute("aria-expanded", "true");
});

test("shows purchase history in eight-item ranges", () => {
  const rangedItems = Array.from({ length: 25 }, (_, index) => ({
    id: `history-${index + 1}`,
    txRef: `AM-${index + 1}`,
    createdAt: new Date(2026, 5, 25 - index).toISOString(),
    accessStatus: "active",
    movie: {
      title: `History Movie ${index + 1}`,
      posterUrl: "poster.jpg",
    },
    payment: {
      amount: 10.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Card payment",
      transactionId: `FLW-${index + 1}`,
    },
  }));
  usePurchaseHistory.mockReturnValue({
    data: { items: rangedItems },
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
  renderPurchaseHistory();

  const rangeSelect = screen.getByLabelText("Select purchase history range");
  expect(screen.getByRole("option", { name: "1 - 8" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "9 - 16" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "17 - 24" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "25" })).toBeInTheDocument();
  expect(screen.getByText("History Movie 1")).toBeInTheDocument();
  expect(screen.queryByText("History Movie 9")).not.toBeInTheDocument();

  fireEvent.change(rangeSelect, { target: { value: "1" } });
  expect(screen.getByText("History Movie 9")).toBeInTheDocument();
  expect(screen.queryByText("History Movie 1")).not.toBeInTheDocument();

  fireEvent.change(rangeSelect, { target: { value: "3" } });
  expect(screen.getByText("History Movie 25")).toBeInTheDocument();
});
