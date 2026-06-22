import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import { confirmPayment } from "../api/paymentApi";
import { createPlaybackSession } from "../api/watchApi";
import { savePendingPayment } from "../utils/pendingPayment";
import PaymentCallback from "./PaymentCallback";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../api/paymentApi", () => ({
  confirmPayment: jest.fn(),
  waitForPaymentCompletion: jest.fn(),
}));

jest.mock("../api/watchApi", () => ({
  createPlaybackSession: jest.fn(),
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

afterEach(() => {
  jest.clearAllMocks();
  window.sessionStorage.clear();
});

test("shows a cancelled Flutterwave return without confirming", async () => {
  getAuthToken.mockReturnValue("test-token");
  renderCallback(
    "/process-payment?status=cancelled&transaction_id=flw-1&tx_ref=tx-1",
  );

  expect(
    await screen.findByRole("heading", { name: "Payment cancelled" }),
  ).toBeInTheDocument();
  expect(confirmPayment).not.toHaveBeenCalled();
});

test("confirms payment and continues into playback", async () => {
  getAuthToken.mockReturnValue("test-token");
  savePendingPayment({
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
