import poster1 from "../assets/images/img_poster1.png";
import poster3 from "../assets/images/img_poster3.png";
import poster4 from "../assets/images/img_poster4.png";
import poster6 from "../assets/images/img_poster6.png";
import poster7 from "../assets/images/img_poster7.png";
import poster18 from "../assets/images/img_poster18.png";

export const purchaseHistoryItems = [
  {
    id: "history-1",
    txRef: "AM-9F7A2C18",
    createdAt: "2026-06-21T18:42:00.000Z",
    accessStatus: "active",
    movie: {
      id: "movie-1",
      title: "King of Boys",
      posterUrl: poster1,
    },
    order: {
      expiryDate: "2026-06-24T18:42:00.000Z",
    },
    payment: {
      amount: 10.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Visa ending in 4242",
      transactionId: "FLW-88310294",
    },
  },
  {
    id: "history-2",
    txRef: "AM-7C3D11B9",
    createdAt: "2026-06-19T09:16:00.000Z",
    accessStatus: "active",
    movie: {
      id: "movie-2",
      title: "The Wedding Party 2",
      posterUrl: poster3,
    },
    order: {
      expiryDate: "2026-06-23T09:16:00.000Z",
    },
    payment: {
      amount: 8.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Mastercard ending in 8888",
      transactionId: "FLW-88277410",
    },
  },
  {
    id: "history-3",
    txRef: "AM-4D2E80F6",
    createdAt: "2026-06-17T21:08:00.000Z",
    accessStatus: "pending",
    movie: {
      id: "movie-3",
      title: "Battle on Buka Street",
      posterUrl: poster4,
    },
    order: null,
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
    movie: {
      id: "movie-4",
      title: "A Tribe Called Judah",
      posterUrl: poster6,
    },
    order: {
      expiryDate: "2026-06-16T13:35:00.000Z",
    },
    payment: {
      amount: 7.99,
      currency: "USD",
      status: "Completed",
      paymentMethod: "Visa ending in 4242",
      transactionId: "FLW-88192306",
    },
  },
  {
    id: "history-5",
    txRef: "AM-6B8D90A4",
    createdAt: "2026-06-11T16:20:00.000Z",
    accessStatus: "failed",
    movie: {
      id: "movie-5",
      title: "Merry Men 2: Another Mission",
      posterUrl: poster7,
    },
    order: null,
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
    movie: {
      id: "movie-6",
      title: "Blood Sisters",
      posterUrl: poster18,
    },
    order: {
      expiryDate: "2026-06-10T11:05:00.000Z",
    },
    payment: null,
  },
];
