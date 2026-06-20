import { useQuery } from "@tanstack/react-query";
import { getActiveOrders } from "../api/ordersApi";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";

export const orderKeys = {
  all: ["orders"],
  active: (ownerKey) => [...orderKeys.all, "active", ownerKey],
};

export function useActiveOrders() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey =
    storedUser?._id || storedUser?.id || (token ? "authenticated" : "guest");

  return useQuery({
    enabled: Boolean(token),
    queryFn: getActiveOrders,
    queryKey: orderKeys.active(ownerKey),
    staleTime: 60 * 1000,
  });
}
