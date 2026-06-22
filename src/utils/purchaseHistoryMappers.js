export function mapPurchaseHistoryResponse(response = {}) {
  return {
    ...response,
    items: (response.items || []).map(mapPurchaseHistoryItem),
  };
}

export function mapPurchaseHistoryItem(item = {}) {
  const payment = item.payment
    ? {
        amount: Math.max(0, Number(item.payment.amount) || 0),
        currency: item.payment.currency || "USD",
        status: item.payment.status || "Pending",
        paymentMethod: getPaymentMethodLabel(item.payment),
        transactionId: item.payment.transactionId || null,
      }
    : null;

  return {
    id: String(item.id || item.txRef || ""),
    txRef: item.txRef || "Reference unavailable",
    createdAt: item.createdAt || item.payment?.createdAt || item.order?.orderDate || "",
    accessStatus: item.accessStatus || "unknown",
    movie: {
      id: String(item.movie?.id || item.order?.movieId || ""),
      title: item.movie?.title || "Unavailable movie",
      posterUrl: item.movie?.posterUrl || item.movie?.bannerUrl || "",
    },
    order: item.order
      ? {
          expiryDate: item.order.expiryDate || null,
        }
      : null,
    payment,
  };
}

function getPaymentMethodLabel(payment) {
  if (payment.paymentMethod === "saved_card") return "Saved card";
  if (payment.paymentMethod === "hosted_card") return "Card payment";
  if (payment.platform === "ios" || payment.provider === "apple") {
    return "Apple App Store";
  }
  if (payment.platform === "android" || payment.provider === "google") {
    return "Google Play";
  }
  return payment.provider === "flutterwave" ? "Card payment" : "Payment";
}
