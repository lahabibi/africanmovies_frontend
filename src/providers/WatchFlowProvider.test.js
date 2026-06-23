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
  chargeSavedCard,
  getPaymentStatus,
  getSavedPaymentMethod,
  initializeInlinePayment,
  savePaymentMethod,
  waitForPaymentCompletion,
  waitForPaymentVerification,
} from "../api/paymentApi";
import { openFlutterwaveInline } from "../utils/flutterwaveInline";
import {
  closePaymentWindow,
  openPaymentWindow,
  redirectToExternalCheckout,
  savePendingPayment,
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
  closePaymentAttempt: jest.fn(),
  confirmPayment: jest.fn(),
  getPaymentStatus: jest.fn(),
  getSavedPaymentMethod: jest.fn(),
  initializeInlinePayment: jest.fn(),
  savePaymentMethod: jest.fn(),
  waitForPaymentCompletion: jest.fn(),
  waitForPaymentVerification: jest.fn(),
}));

jest.mock("../utils/flutterwaveInline", () => ({
  FlutterwaveInlineCancelledError: class extends Error {},
  openFlutterwaveInline: jest.fn(),
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
const originalWindowFocus = window.focus;

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
  window.focus = jest.fn();
  paymentWindow.closed = false;
  openPaymentWindow.mockReturnValue(paymentWindow);
  subscribeToPaymentResults.mockImplementation((handler) => {
    paymentResultHandler = handler;
    return jest.fn();
  });
  waitForPaymentCompletion.mockReturnValue(new Promise(() => undefined));
  waitForPaymentVerification.mockReturnValue(new Promise(() => undefined));
  openFlutterwaveInline.mockReturnValue(new Promise(() => undefined));
});

afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterAll(() => {
  window.focus = originalWindowFocus;
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

test("requires card entry instead of offering an expired saved token", async () => {
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
      last4Digits: "4242",
    },
    tokenStatus: {
      active: false,
      reason: "token_expired",
      refreshRequired: true,
    },
  });
  initializeInlinePayment.mockResolvedValue({
    amount: 10.99,
    currency: "USD",
    customer: { email: "viewer@example.com", name: "Viewer" },
    publicKey: "FLWPUBK_TEST-key-X",
    txRef: "tx-refresh-1",
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );

  expect(
    await screen.findByRole("heading", { name: "Refresh saved card" }),
  ).toBeInTheDocument();
  expect(chargeSavedCard).not.toHaveBeenCalled();
  expect(openPaymentWindow).not.toHaveBeenCalled();

  fireEvent.click(
    screen.getByRole("button", { name: "Enter card details" }),
  );

  await waitFor(() => {
    expect(initializeInlinePayment).toHaveBeenCalledWith(
      movie.id,
      expect.stringContaining(`web-inline-${movie.id}-`),
    );
  });
});

test("opens Flutterwave Inline without a popup when the user has no saved card", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({ tokenPayload: null });
  initializeInlinePayment.mockResolvedValue({
    amount: 10.99,
    code: "INLINE_CHECKOUT_READY",
    currency: "USD",
    customer: { email: "viewer@example.com", name: "Viewer" },
    publicKey: "FLWPUBK_TEST-key-X",
    txRef: "tx-1",
  });
  renderFlow();

  fireEvent.click(screen.getByRole("button", { name: "Watch" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );

  await waitFor(() => {
    expect(initializeInlinePayment).toHaveBeenCalledWith(
      movie.id,
      expect.stringContaining(`web-inline-${movie.id}-`),
    );
  });
  expect(openFlutterwaveInline).toHaveBeenCalledWith(
    expect.objectContaining({ txRef: "tx-1" }),
  );
  expect(openPaymentWindow).not.toHaveBeenCalled();
  expect(redirectToExternalCheckout).not.toHaveBeenCalled();
});

test("starts playback in the main window after saved-card popup verification", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({
    tokenPayload: { _id: "card-1", cardType: "visa", last4Digits: "4242" },
  });
  chargeSavedCard.mockResolvedValue({
    code: "AUTHORIZATION_REQUIRED",
    redirectUrl: "https://flutterwave.test/authorize",
    transactionId: "flw-popup-1",
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
      transactionId: "flw-popup-1",
      txRef: "tx-popup-1",
    });
  });

  expect(await screen.findByText("Player route")).toBeInTheDocument();
  expect(closePaymentWindow).toHaveBeenCalledWith(paymentWindow);
  expect(createPlaybackSession).toHaveBeenCalledWith(movie.id);
});

test("actively verifies a saved-card payment without a popup message", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({
    tokenPayload: { _id: "card-1", cardType: "visa", last4Digits: "4242" },
  });
  chargeSavedCard.mockResolvedValue({
    code: "AUTHORIZATION_REQUIRED",
    redirectUrl: "https://flutterwave.test/authorize",
    transactionId: "flw-polled-1",
    txRef: "tx-polled-1",
  });
  waitForPaymentVerification.mockResolvedValue({
    movieId: movie.id,
    transactionId: "flw-polled-1",
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
  fireEvent.click(
    await screen.findByRole("button", { name: "Pay $10.99" }),
  );

  expect(await screen.findByText("Player route")).toBeInTheDocument();
  expect(screen.getByText("Payment successful")).toBeInTheDocument();
  expect(waitForPaymentVerification).toHaveBeenCalledWith(
    {
      transactionId: "flw-polled-1",
      txRef: "tx-polled-1",
    },
    { attempts: 120, interval: 1500 },
  );
  expect(createPlaybackSession).toHaveBeenCalledWith(movie.id);
});

test("recovers the transaction ID for an older pending saved-card session", async () => {
  savePendingPayment({
    method: "saved_card",
    movieId: movie.id,
    movieTitle: movie.title,
    txRef: "tx-existing-1",
  });
  getPaymentStatus.mockResolvedValue({
    movieId: movie.id,
    status: "pending",
    transactionId: "flw-existing-1",
  });
  waitForPaymentVerification.mockResolvedValue({
    movieId: movie.id,
    status: "successful",
    transactionId: "flw-existing-1",
  });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movie.id, title: movie.title },
    playback: { expiresIn: 300, url: "https://example.com/movie.m3u8" },
    status: "READY",
  });

  renderFlow();

  expect(await screen.findByText("Player route")).toBeInTheDocument();
  expect(getPaymentStatus).toHaveBeenCalledWith("tx-existing-1");
  expect(waitForPaymentVerification).toHaveBeenCalledWith(
    {
      transactionId: "flw-existing-1",
      txRef: "tx-existing-1",
    },
    { attempts: 120, interval: 1500 },
  );
});

test("verifies Inline payment before offering to save the new card", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({ tokenPayload: null });
  initializeInlinePayment.mockResolvedValue({
    amount: 10.99,
    currency: "USD",
    customer: { email: "viewer@example.com", name: "Viewer" },
    publicKey: "FLWPUBK_TEST-key-X",
    txRef: "tx-inline-1",
  });
  openFlutterwaveInline.mockResolvedValue({
    status: "successful",
    transaction_id: "flw-inline-1",
    tx_ref: "tx-inline-1",
  });
  waitForPaymentVerification.mockResolvedValue({
    movieId: movie.id,
    status: "successful",
    transactionId: "flw-inline-1",
  });
  savePaymentMethod.mockResolvedValue({ status: "success" });
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

  expect(
    await screen.findByRole("heading", { name: "Save this card?" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Payment successful")).toBeInTheDocument();
  expect(waitForPaymentVerification).toHaveBeenCalledWith(
    { transactionId: "flw-inline-1", txRef: "tx-inline-1" },
    { attempts: 30, interval: 2000 },
  );

  fireEvent.click(screen.getByRole("button", { name: "Save card" }));

  expect(
    await screen.findByText("Card saved successfully"),
  ).toBeInTheDocument();
  expect(savePaymentMethod).toHaveBeenCalledWith({
    isNewCard: true,
    transactionId: "flw-inline-1",
  });
});

test("notifies when a saved card is replaced", async () => {
  getAuthToken.mockReturnValue("test-token");
  getWatchAccess.mockResolvedValue({
    action: "PURCHASE",
    movie: { id: movie.id, title: movie.title, price: 10.99, currency: "USD" },
    reason: "PURCHASE_REQUIRED",
  });
  getSavedPaymentMethod.mockResolvedValue({
    tokenPayload: { _id: "card-1", cardType: "visa", last4Digits: "4242" },
  });
  initializeInlinePayment.mockResolvedValue({
    amount: 10.99,
    currency: "USD",
    customer: { email: "viewer@example.com", name: "Viewer" },
    publicKey: "FLWPUBK_TEST-key-X",
    txRef: "tx-replace-1",
  });
  openFlutterwaveInline.mockResolvedValue({
    status: "successful",
    transaction_id: "flw-replace-1",
    tx_ref: "tx-replace-1",
  });
  waitForPaymentVerification.mockResolvedValue({
    movieId: movie.id,
    status: "successful",
    transactionId: "flw-replace-1",
  });
  savePaymentMethod.mockResolvedValue({ status: "success" });
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
  fireEvent.click(
    await screen.findByRole("button", { name: "Use another card" }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Replace card" }),
  );

  expect(
    await screen.findByText("Saved card updated successfully"),
  ).toBeInTheDocument();
});
