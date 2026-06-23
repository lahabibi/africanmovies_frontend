import {
  getSavedCardAttentionCopy,
  mapSavedPaymentMethodResponse,
} from "./paymentMethodMappers";

test("maps an active saved card from the payment token response", () => {
  expect(
    mapSavedPaymentMethodResponse({
      tokenPayload: {
        _id: "card-1",
        cardType: "VISA",
        expiry: "04/28",
        last4Digits: "4242",
      },
      tokenStatus: {
        active: true,
        reason: "active",
      },
    }),
  ).toEqual({
    brand: "visa",
    expires: "04/28",
    id: "card-1",
    status: "active",
    statusLabel: "Active",
    statusReason: "active",
    title: "Visa ending in 4242",
  });
});

test("maps an expired token to a refresh state without exposing token data", () => {
  const method = mapSavedPaymentMethodResponse({
    tokenPayload: {
      _id: "card-2",
      cardType: "mastercard",
      expiry: "07/29",
      last4Digits: "8888",
      token: "must-not-be-used",
    },
    tokenStatus: {
      active: false,
      reason: "token_expired",
      refreshRequired: true,
    },
  });

  expect(method).toMatchObject({
    brand: "mastercard",
    status: "attention",
    statusLabel: "Needs refresh",
    title: "Mastercard ending in 8888",
  });
  expect(method).not.toHaveProperty("token");
  expect(getSavedCardAttentionCopy(method.statusReason).title).toBe(
    "Saved card needs refreshing",
  );
});

test("returns no method when the account has no token payload", () => {
  expect(
    mapSavedPaymentMethodResponse({
      tokenPayload: null,
      tokenStatus: null,
    }),
  ).toBeNull();
});
