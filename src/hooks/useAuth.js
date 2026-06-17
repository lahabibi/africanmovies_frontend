import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserById,
  logout,
  requestOtp,
  verifyOtp,
} from "../api/authApi";
import {
  clearAuthSession,
  getAuthToken,
  getStoredAuthUser,
  setAuthToken,
  setStoredAuthUser,
} from "../api/authToken";

export const authKeys = {
  currentUser: ["auth", "currentUser"],
};

export function useCurrentUser() {
  const token = getAuthToken();
  const storedUser = getStoredAuthUser();
  const userId = storedUser?._id || storedUser?.id;

  return useQuery({
    enabled: Boolean(token && userId),
    initialData: token ? storedUser : null,
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const user = await getUserById(userId);
      const normalizedUser = normalizeUser(user);
      setStoredAuthUser(normalizedUser);
      return normalizedUser;
    },
    queryKey: authKeys.currentUser,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: requestOtp,
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data?.token) {
        setAuthToken(data.token);
      }

      if (data?.user) {
        const normalizedUser = normalizeUser(data.user);
        setStoredAuthUser(normalizedUser);
        queryClient.setQueryData(authKeys.currentUser, normalizedUser);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession();
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: authKeys.currentUser });
    },
  });
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id || user._id,
    name: user.name || user.username || "User",
    avatar: user.avatar || user.profileURL || null,
  };
}
