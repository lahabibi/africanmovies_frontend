import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  useDeleteSavedPaymentMethod,
  useSavedPaymentMethod,
} from "../hooks/usePayments";
import PaymentDetails from "./PaymentDetails";

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../components/layout/Footer", () => () => null);
jest.mock("../components/account/AccountSidebar", () => () => null);
jest.mock("../hooks/usePayments", () => ({
  useDeleteSavedPaymentMethod: jest.fn(),
  useSavedPaymentMethod: jest.fn(),
}));

const refetchSavedPaymentMethod = jest.fn();
const deleteSavedPaymentMethod = jest.fn();

function renderPaymentDetails() {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <PaymentDetails />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  deleteSavedPaymentMethod.mockResolvedValue({ deleted: true });
  useDeleteSavedPaymentMethod.mockReturnValue({
    isPending: false,
    mutateAsync: deleteSavedPaymentMethod,
  });
  useSavedPaymentMethod.mockReturnValue({
    data: {
      brand: "visa",
      expires: "04/28",
      id: "card-1",
      status: "active",
      statusLabel: "Active",
      statusReason: "active",
      title: "Visa ending in 4242",
    },
    isError: false,
    isLoading: false,
    refetch: refetchSavedPaymentMethod,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("presents the single saved card without multi-card controls", () => {
  renderPaymentDetails();

  expect(
    screen.getByRole("heading", { name: "Saved Card" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Visa ending in 4242")).toBeInTheDocument();
  expect(screen.getByText("Active")).toBeInTheDocument();
  expect(screen.getByText("Faster checkout")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Set as default/i }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Mastercard ending/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Verve ending/i)).not.toBeInTheDocument();
});

test("shows an empty state when the account has no saved card", () => {
  useSavedPaymentMethod.mockReturnValue({
    data: null,
    isError: false,
    isLoading: false,
    refetch: refetchSavedPaymentMethod,
  });

  renderPaymentDetails();

  expect(screen.getByText("No saved card")).toBeInTheDocument();
  expect(screen.queryByText("Faster checkout")).not.toBeInTheDocument();
});

test("allows a failed saved-card request to be retried", () => {
  useSavedPaymentMethod.mockReturnValue({
    data: undefined,
    isError: true,
    isLoading: false,
    refetch: refetchSavedPaymentMethod,
  });

  renderPaymentDetails();
  fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

  expect(refetchSavedPaymentMethod).toHaveBeenCalledTimes(1);
});

test("removes the saved card only after confirmation", async () => {
  renderPaymentDetails();

  fireEvent.click(
    screen.getByRole("button", { name: "Remove Visa ending in 4242" }),
  );

  expect(deleteSavedPaymentMethod).not.toHaveBeenCalled();
  expect(
    screen.getByRole("heading", { name: "Remove saved card?" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Remove Card" }));

  await waitFor(() => {
    expect(deleteSavedPaymentMethod).toHaveBeenCalledTimes(1);
  });
  expect(
    await screen.findByText("Saved card removed successfully"),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Remove saved card?" }),
  ).not.toBeInTheDocument();
});
