import { useQuery } from "@tanstack/react-query";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";
import { getPurchaseHistory, getSavedPaymentMethod } from "../api/paymentApi";
import { mapSavedPaymentMethodResponse } from "../utils/paymentMethodMappers";
import { mapPurchaseHistoryResponse } from "../utils/purchaseHistoryMappers";

export const paymentKeys = {
  all: ["payments"],
  history: (ownerKey) => [...paymentKeys.all, "history", ownerKey],
  savedMethod: (ownerKey) => [...paymentKeys.all, "saved-method", ownerKey],
};

function getPaymentOwnerKey(token, storedUser) {
  return (
    storedUser?._id || storedUser?.id || (token ? "authenticated" : "guest")
  );
}

export function usePurchaseHistory() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey = getPaymentOwnerKey(token, storedUser);

  return useQuery({
    enabled: Boolean(token),
    queryFn: async () => mapPurchaseHistoryResponse(await getPurchaseHistory()),
    queryKey: paymentKeys.history(ownerKey),
    staleTime: 30 * 1000,
  });
}

export function useSavedPaymentMethod() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey = getPaymentOwnerKey(token, storedUser);

  return useQuery({
    enabled: Boolean(token),
    queryFn: async () =>
      mapSavedPaymentMethodResponse(await getSavedPaymentMethod()),
    queryKey: paymentKeys.savedMethod(ownerKey),
    staleTime: 0,
  });
}
