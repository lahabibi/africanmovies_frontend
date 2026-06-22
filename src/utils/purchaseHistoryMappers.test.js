import {
  mapPurchaseHistoryItem,
  mapPurchaseHistoryResponse,
} from "./purchaseHistoryMappers";

test("maps Flutterwave history into the purchase UI shape", () => {
  const item = mapPurchaseHistoryItem({
    id: "history-1",
    txRef: "tx-1",
    accessStatus: "active",
    createdAt: "2026-06-22T10:00:00.000Z",
    movie: {
      id: "movie-1",
      title: "The Story",
      posterUrl: "poster.jpg",
    },
    payment: {
      amount: 10.99,
      currency: "USD",
      paymentMethod: "saved_card",
      provider: "flutterwave",
      status: "Completed",
      transactionId: "flw-1",
    },
  });

  expect(item).toMatchObject({
    accessStatus: "active",
    movie: { id: "movie-1", title: "The Story" },
    payment: {
      amount: 10.99,
      paymentMethod: "Saved card",
      status: "Completed",
    },
  });
});

test("maps native and free order-only history safely", () => {
  const response = mapPurchaseHistoryResponse({
    items: [
      {
        id: "native-1",
        txRef: "native-tx",
        movie: { title: "Native Story" },
        payment: {
          amount: 5,
          platform: "ios",
          provider: "apple",
          status: "Completed",
        },
      },
      {
        id: "free-1",
        txRef: "free-tx",
        movie: null,
        order: { movieId: "removed-movie" },
        payment: null,
      },
    ],
  });

  expect(response.items[0].payment.paymentMethod).toBe("Apple App Store");
  expect(response.items[1]).toMatchObject({
    movie: { id: "removed-movie", title: "Unavailable movie" },
    payment: null,
  });
});
