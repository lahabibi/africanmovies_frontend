import { useQuery } from "@tanstack/react-query";
import { getAuthToken, getStoredAuthUser } from "../api/authToken";
import { getWatchAccess } from "../api/watchApi";

export const watchAccessKeys = {
  all: ["watch-access"],
  decision: (movieId, ownerKey) => [
    ...watchAccessKeys.all,
    String(movieId || ""),
    ownerKey,
  ],
};

export function getWatchAccessQueryKey(movieId) {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const ownerKey =
    storedUser?._id || storedUser?.id || (token ? "authenticated" : "guest");

  return watchAccessKeys.decision(movieId, ownerKey);
}

export function useWatchAccessDecision(movieId, { enabled = true } = {}) {
  const token = getAuthToken();

  return useQuery({
    enabled: Boolean(enabled && token && isMongoObjectId(movieId)),
    queryFn: () => getWatchAccess(movieId),
    queryKey: getWatchAccessQueryKey(movieId),
    retry: 1,
    staleTime: 30 * 1000,
  });
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}
