import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { deleteSavedPaymentMethod } from "../api/paymentApi";
import {
  paymentKeys,
  useDeleteSavedPaymentMethod,
} from "./usePayments";

jest.mock("../api/paymentApi", () => ({
  ...jest.requireActual("../api/paymentApi"),
  deleteSavedPaymentMethod: jest.fn(),
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

function createWrapper(queryClient) {
  return function QueryWrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

test("deleting a saved card clears its user-scoped cache", async () => {
  window.localStorage.setItem("africanmovies.authToken", "test-token");
  window.localStorage.setItem(
    "africanmovies.authUser",
    JSON.stringify({ _id: "user-1" }),
  );
  deleteSavedPaymentMethod.mockResolvedValue({ deleted: true });

  const queryClient = createQueryClient();
  const queryKey = paymentKeys.savedMethod("user-1");
  queryClient.setQueryData(queryKey, {
    id: "card-1",
    title: "Visa ending in 4242",
  });

  const { result } = renderHook(() => useDeleteSavedPaymentMethod(), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.mutateAsync();
  });

  expect(deleteSavedPaymentMethod).toHaveBeenCalledTimes(1);
  expect(queryClient.getQueryData(queryKey)).toBeNull();
  queryClient.clear();
});
