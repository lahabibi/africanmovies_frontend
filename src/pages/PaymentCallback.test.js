import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  closePaymentAttempt,
  confirmPayment,
  savePaymentMethod,
} from "../api/paymentApi";
import { createPlaybackSession } from "../api/watchApi";
import {
  isPaymentWindow,
  publishPaymentResult,
  savePendingPayment,
} from "../utils/pendingPayment";
import PaymentCallback from "./PaymentCallback";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../api/paymentApi", () => ({
  closePaymentAttempt: jest.fn(),
  confirmPayment: jest.fn(),
  getSavedPaymentMethod: jest.fn(),
  savePaymentMethod: jest.fn(),
  waitForPaymentCompletion: jest.fn(),
}));

jest.mock("../api/watchApi", () => ({
  createPlaybackSession: jest.fn(),
}));

jest.mock("../utils/pendingPayment", () => ({
  ...jest.requireActual("../utils/pendingPayment"),
  closePaymentWindow: jest.fn(),
  isPaymentWindow: jest.fn(),
  publishPaymentResult: jest.fn(),
}));

const movieId = "6a1e54e7be4244a731af7b07";

function renderCallback(entry) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={[entry]}
      >
        <Routes>
          <Route path="/process-payment" element={<PaymentCallback />} />
          <Route path="/playback/:movieId" element={<p>Playback opened</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  isPaymentWindow.mockReturnValue(false);
});

afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

test("shows a cancelled Flutterwave return without confirming", async () => {
  getAuthToken.mockReturnValue("test-token");
  closePaymentAttempt.mockResolvedValue({
    code: "PAYMENT_ATTEMPT_CLOSED",
    status: "failed",
    txRef: "tx-1",
  });
  renderCallback(
    "/process-payment?status=cancelled&transaction_id=flw-1&tx_ref=tx-1",
  );

  expect(
    await screen.findByRole("heading", { name: "Payment cancelled" }),
  ).toBeInTheDocument();
  expect(closePaymentAttempt).toHaveBeenCalledWith({
    providerStatus: "cancelled",
    txRef: "tx-1",
  });
  expect(confirmPayment).not.toHaveBeenCalled();
});

test("confirms payment and continues into playback", async () => {
  getAuthToken.mockReturnValue("test-token");
  savePendingPayment({
    method: "saved_card",
    movieId,
    movieTitle: "The Story",
    returnPath: `/movies/${movieId}`,
    txRef: "tx-1",
  });
  confirmPayment.mockResolvedValue({ movieId, status: "successful" });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movieId, title: "The Story" },
    playback: { expiresIn: 300, url: "https://example.com/movie.m3u8" },
    status: "READY",
  });
  renderCallback(
    "/process-payment?status=successful&transaction_id=flw-1&tx_ref=tx-1",
  );

  expect(await screen.findByText("Playback opened")).toBeInTheDocument();
  expect(confirmPayment).toHaveBeenCalledWith({
    transactionId: "flw-1",
    txRef: "tx-1",
  });
  expect(createPlaybackSession).toHaveBeenCalledWith(movieId);
});

test("offers to save a newly used card before starting playback", async () => {
  getAuthToken.mockReturnValue("test-token");
  savePendingPayment({
    hadSavedCard: false,
    method: "hosted_card",
    movieId,
    movieTitle: "The Story",
    returnPath: `/movies/${movieId}`,
    txRef: "tx-1",
  });
  confirmPayment.mockResolvedValue({ movieId, status: "successful" });
  savePaymentMethod.mockResolvedValue({
    cardType: "visa",
    last4Digits: "4242",
  });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movieId, title: "The Story" },
    playback: { expiresIn: 300, url: "https://example.com/movie.m3u8" },
    status: "READY",
  });
  renderCallback(
    "/process-payment?status=successful&transaction_id=flw-1&tx_ref=tx-1",
  );

  expect(
    await screen.findByRole("heading", { name: "Save this card?" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save card" }));

  expect(await screen.findByText("Playback opened")).toBeInTheDocument();
  expect(savePaymentMethod).toHaveBeenCalledWith({
    isNewCard: true,
    transactionId: "flw-1",
  });
});

test("offers to replace an existing card after using another card", async () => {
  getAuthToken.mockReturnValue("test-token");
  savePendingPayment({
    hadSavedCard: true,
    method: "hosted_card",
    movieId,
    movieTitle: "The Story",
    returnPath: `/movies/${movieId}`,
    txRef: "tx-1",
  });
  confirmPayment.mockResolvedValue({ movieId, status: "successful" });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movieId, title: "The Story" },
    playback: { expiresIn: 300, url: "https://example.com/movie.m3u8" },
    status: "READY",
  });
  renderCallback(
    "/process-payment?status=successful&transaction_id=flw-1&tx_ref=tx-1",
  );

  expect(
    await screen.findByRole("heading", { name: "Replace saved card?" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Not now" }));

  expect(await screen.findByText("Playback opened")).toBeInTheDocument();
  expect(savePaymentMethod).not.toHaveBeenCalled();
});

test("returns verified popup payment to the main window", async () => {
  isPaymentWindow.mockReturnValue(true);
  getAuthToken.mockReturnValue("test-token");
  savePendingPayment({
    method: "saved_card",
    movieId,
    movieTitle: "The Story",
    returnPath: `/movies/${movieId}`,
    txRef: "tx-popup-1",
  });
  confirmPayment.mockResolvedValue({ movieId, status: "successful" });
  renderCallback(
    "/process-payment?status=successful&transaction_id=flw-1&tx_ref=tx-popup-1",
  );

  expect(await screen.findByText("Payment confirmed. Returning to your movie.")).toBeInTheDocument();
  expect(publishPaymentResult).toHaveBeenCalledWith({
    movieId,
    movieTitle: "The Story",
    status: "successful",
    txRef: "tx-popup-1",
  });
  expect(createPlaybackSession).not.toHaveBeenCalled();
});
