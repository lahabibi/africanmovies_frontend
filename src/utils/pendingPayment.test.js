import {
  clearPaymentResult,
  publishPaymentResult,
  subscribeToPaymentResults,
} from "./pendingPayment";

afterEach(() => {
  clearPaymentResult();
  jest.clearAllMocks();
});

test("accepts payment messages only from the current origin", () => {
  const handler = jest.fn();
  const unsubscribe = subscribeToPaymentResults(handler);
  const result = {
    source: "africanmovies-payment",
    status: "successful",
    txRef: "tx-1",
  };

  window.dispatchEvent(
    new MessageEvent("message", {
      data: result,
      origin: "https://untrusted.example",
    }),
  );
  window.dispatchEvent(
    new MessageEvent("message", {
      data: result,
      origin: window.location.origin,
    }),
  );

  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith(result);
  unsubscribe();
});

test("publishes a recoverable payment result", () => {
  publishPaymentResult({
    movieId: "movie-1",
    status: "successful",
    txRef: "tx-1",
  });

  expect(
    JSON.parse(window.localStorage.getItem("africanmovies.paymentResult")),
  ).toMatchObject({
    movieId: "movie-1",
    source: "africanmovies-payment",
    status: "successful",
    txRef: "tx-1",
  });
});
