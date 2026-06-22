import { useQuery } from "@tanstack/react-query";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";
import { getPurchaseHistory } from "../api/paymentApi";
import { mapPurchaseHistoryResponse } from "../utils/purchaseHistoryMappers";

export const paymentKeys = {
  all: ["payments"],
  history: (ownerKey) => [...paymentKeys.all, "history", ownerKey],
};

export function usePurchaseHistory() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey =
    storedUser?._id || storedUser?.id || (token ? "authenticated" : "guest");

  return useQuery({
    enabled: Boolean(token),
    queryFn: async () => mapPurchaseHistoryResponse(await getPurchaseHistory()),
    queryKey: paymentKeys.history(ownerKey),
    staleTime: 30 * 1000,
  });
}
