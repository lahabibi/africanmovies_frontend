import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  claimFreeMovie,
  createPlaybackSession,
  getWatchAccess,
} from "../api/watchApi";
import {
  getSavedPaymentMethod,
  initializeHostedPayment,
} from "../api/paymentApi";
import {
  closePaymentWindow,
  openPaymentWindow,
  redirectToExternalCheckout,
  subscribeToPaymentResults,
} from "../utils/pendingPayment";
import WatchFlowProvider, { useWatchFlow } from "./WatchFlowProvider";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
  getStoredAuthUser: jest.fn(() => null),
}));

jest.mock("../api/watchApi", () => ({
  claimFreeMovie: jest.fn(),
  createPlaybackSession: jest.fn(),
  getWatchAccess: jest.fn(),
}));

jest.mock("../api/paymentApi", () => ({
  chargeSavedCard: jest.fn(),
  confirmPayment: jest.fn(),
  getSavedPaymentMethod: jest.fn(),
  initializeHostedPayment: jest.fn(),
  waitForPaymentCompletion: jest.fn(),
}));

jest.mock("../utils/pendingPayment", () => ({
  ...jest.requireActual("../utils/pendingPayment"),
  closePaymentWindow: jest.fn(),
  openPaymentWindow: jest.fn(),
  redirectToExternalCheckout: jest.fn(),
  subscribeToPaymentResults: jest.fn(),
}));

const movie = {
  id: "6a1e54e7be4244a731af7b07",
  slug: "6a1e54e7be4244a731af7b07",
  title: "The Story",
};
const paymentWindow = {
  closed: false,
  close: jest.fn(),
  focus: jest.fn(),
  location: {},
  sessionStorage: window.sessionStorage,
};
let paymentResultHandler;

function WatchTrigger() {
  const { startWatch } = useWatchFlow();
  return (
    <button onClick={() => startWatch(movie)} type="button">
      Watch
    </button>
  );
}

function renderFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={["/"]}
      >
        <WatchFlowProvider>
          <Routes>
            <Route path="/" element={<WatchTrigger />} />
            <Route path="/signin" element={<p>Sign in page</p>} />
            <Route path="/playback/:movieId" element={<p>Player route</p>} />
          </Routes>
        </WatchFlowProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  paymentWindow.closed = false;
  openPaymentWindow.mockReturnValue(paymentWindow);
  subscribeToPaymentResults.mockImplementation((handler) => {
    paymentResultHandler = handler;
    return jest.fn();
  });
});

afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

test("redirects signed-out viewers to authentication", () => {
  getAuthToken.mockReturnValue(null);
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));

  expect(screen.getByText("Sign in page")).toBeInTheDocument();
  expect(getWatchAccess).not.toHaveBeenCalled();
});

test("confirms a free claim and opens playback", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "CLAIM_FREE",
    movie: { id: movie.id, title: movie.title, price: 0.99, currency: "USD" },
    reason: "FIRST_FREE_CLAIM",
  });
  claimFreeMovie.mockResolvedValue({ action: "PLAY", claimed: true });
  createPlaybackSession.mockResolvedValue({
    status: "READY",
    access: { orderId: "order-1", currentTime: 0 },
    movie: { id: movie.id, title: movie.title },
    playback: { url: "https://example.com/movie.m3u8", expiresIn: 300 },
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Claim & Watch" }),
  );

  expect(await screen.findByText("Player route")).toBeInTheDocument();
  expect(claimFreeMovie).toHaveBeenCalledWith(movie.id);
  expect(createPlaybackSession).toHaveBeenCalledWith(movie.id);
});

test("shows the backend purchase decision without starting playback", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));

  expect(
    await screen.findByRole("heading", { name: `Unlock ${movie.title}` }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Pay $10.99" }),
  ).toBeInTheDocument();
  expect(createPlaybackSession).not.toHaveBeenCalled();
});

test("offers saved or different card after the user continues to payment", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({
    tokenPayload: {
      _id: "card-1",
      cardType: "visa",
      expiry: "04/28",
      last4Digits: "4242",
    },
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );

  expect(
    await screen.findByRole("heading", { name: "Choose payment method" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Visa ending in 4242")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Use another card" }),
  ).toBeInTheDocument();
});

test("starts hosted checkout when the user has no saved card", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({ tokenPayload: null });
  initializeHostedPayment.mockResolvedValue({
    checkoutUrl: "https://checkout.flutterwave.com/test",
    code: "CHECKOUT_READY",
    txRef: "tx-1",
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );

  await waitFor(() => {
    expect(initializeHostedPayment).toHaveBeenCalledWith(
      movie.id,
      expect.stringContaining(`web-hosted-${movie.id}-`),
    );
  });
  expect(openPaymentWindow).toHaveBeenCalled();
  expect(redirectToExternalCheckout).toHaveBeenCalledWith(
    "https://checkout.flutterwave.com/test",
    paymentWindow,
  );
});

test("starts playback in the main window after popup verification", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({ tokenPayload: null });
  initializeHostedPayment.mockResolvedValue({
    checkoutUrl: "https://checkout.flutterwave.com/test",
    code: "CHECKOUT_READY",
    txRef: "tx-popup-1",
  });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movie.id, title: movie.title },
    playback: { expiresIn: 300, url: "https://example.com/movie.m3u8" },
    status: "READY",
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );
  await waitFor(() =>
    expect(redirectToExternalCheckout).toHaveBeenCalled(),
  );

  await act(async () => {
    await paymentResultHandler({
      movieId: movie.id,
      source: "africanmovies-payment",
      status: "successful",
      txRef: "tx-popup-1",
    });
  });

  expect(await screen.findByText("Player route")).toBeInTheDocument();
  expect(closePaymentWindow).toHaveBeenCalledWith(paymentWindow);
  expect(createPlaybackSession).toHaveBeenCalledWith(movie.id);
});
