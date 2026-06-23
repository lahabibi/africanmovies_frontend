import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteProfileImage,
  getActiveDevices,
  getUserById,
  logout,
  logoutDevice,
  logoutOtherDevices,
  requestOtp,
  updateUsername,
  uploadProfileImage,
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
  devices: ["auth", "devices"],
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
      queryClient.removeQueries({ queryKey: ["catalog", "movies", "saved"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUsername,
    onSuccess: (data) => {
      commitCurrentUser(queryClient, data?.user, data?.token);
    },
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (data) => {
      const currentUser =
        queryClient.getQueryData(authKeys.currentUser) || getStoredAuthUser();
      commitCurrentUser(
        queryClient,
        {
          ...currentUser,
          avatar: data?.fileLocation,
          profileURL: data?.fileLocation,
        },
        data?.token,
      );
    },
  });
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: (data) => {
      const currentUser =
        queryClient.getQueryData(authKeys.currentUser) || getStoredAuthUser();
      commitCurrentUser(
        queryClient,
        {
          ...currentUser,
          avatar: data?.profileURL,
          profileURL: data?.profileURL,
        },
        data?.token,
      );
    },
  });
}

export function useActiveDevices() {
  const token = getAuthToken();

  return useQuery({
    enabled: Boolean(token),
    queryFn: getActiveDevices,
    queryKey: authKeys.devices,
    staleTime: 30 * 1000,
  });
}

export function useLogoutDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutDevice,
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(authKeys.devices, (devices = []) =>
        devices.filter(
          (device) => String(device._id || device.id) !== String(sessionId),
        ),
      );
    },
  });
}

export function useLogoutOtherDevices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutOtherDevices,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.devices, (devices = []) =>
        devices.filter((device) => device.isCurrent),
      );
    },
  });
}

function commitCurrentUser(queryClient, user, token) {
  if (token) {
    setAuthToken(token);
  }

  const normalizedUser = normalizeUser(user);
  setStoredAuthUser(normalizedUser);
  queryClient.setQueryData(authKeys.currentUser, normalizedUser);
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
