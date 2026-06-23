const CARD_STATUS = {
  CARD_EXPIRED: "card_expired",
  TOKEN_EXPIRED: "token_expired",
  TOKEN_INVALID: "token_invalid",
};

export function mapSavedPaymentMethodResponse(response = {}) {
  const card = response?.tokenPayload;

  if (!card) {
    return null;
  }

  const brand = normalizeCardBrand(card.cardType);
  const brandLabel = getBrandLabel(brand);
  const lastFour = String(card.last4Digits || "")
    .replace(/\D/g, "")
    .slice(-4);
  const statusReason = response?.tokenStatus?.reason || CARD_STATUS.TOKEN_INVALID;
  const isActive = response?.tokenStatus?.active === true;

  return {
    brand,
    expires: card.expiry || null,
    id: String(card._id || card.id || "saved-card"),
    status: isActive ? "active" : "attention",
    statusLabel: getStatusLabel(statusReason, isActive),
    statusReason,
    title: lastFour ? `${brandLabel} ending in ${lastFour}` : brandLabel,
  };
}

export function getSavedCardAttentionCopy(reason) {
  if (reason === CARD_STATUS.CARD_EXPIRED) {
    return {
      description:
        "Use another card during your next payment to update your saved card.",
      title: "Card expired",
    };
  }

  return {
    description:
      "Enter this or another card during your next payment to refresh your saved card.",
    title: "Saved card needs refreshing",
  };
}

function normalizeCardBrand(cardType) {
  const normalized = String(cardType || "").toLowerCase();

  if (normalized.includes("master")) return "mastercard";
  if (normalized.includes("verve")) return "verve";
  if (normalized.includes("visa")) return "visa";
  return "card";
}

function getBrandLabel(brand) {
  if (brand === "mastercard") return "Mastercard";
  if (brand === "verve") return "Verve";
  if (brand === "visa") return "Visa";
  return "Saved card";
}

function getStatusLabel(reason, isActive) {
  if (isActive) return "Active";
  if (reason === CARD_STATUS.CARD_EXPIRED) return "Card expired";
  if (reason === CARD_STATUS.TOKEN_EXPIRED) return "Needs refresh";
  return "Unavailable";
}
