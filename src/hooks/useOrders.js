import { useQuery } from "@tanstack/react-query";
import { getActiveOrders, getLibrary } from "../api/ordersApi";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";
import { mapLibraryItem } from "../utils/libraryMappers";

export const orderKeys = {
  all: ["orders"],
  active: (ownerKey) => [...orderKeys.all, "active", ownerKey],
  library: (ownerKey) => [...orderKeys.all, "library", ownerKey],
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

export function useLibrary() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey =
    storedUser?._id || storedUser?.id || (token ? "authenticated" : "guest");

  return useQuery({
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await getLibrary();
      return {
        ...response,
        items: (response?.items || []).map((item) => mapLibraryItem(item)),
      };
    },
    queryKey: orderKeys.library(ownerKey),
    staleTime: 0,
  });
}
