import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  toggleMovieFavorite,
  toggleMovieWatchlist,
} from "../api/catalogApi";
import {
  catalogKeys,
  useToggleMovieFavorite,
  useToggleMovieWatchlist,
} from "./useCatalog";

jest.mock("../api/catalogApi", () => ({
  ...jest.requireActual("../api/catalogApi"),
  toggleMovieFavorite: jest.fn(),
  toggleMovieWatchlist: jest.fn(),
}));

const movieId = "6a1e54e7be4244a731af7b07";

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
});

test("favorite mutation updates the cached filled state", async () => {
  const queryClient = createQueryClient();
  queryClient.setQueryData(catalogKeys.movieUserData(movieId), {
    isFavorite: false,
    inWatchlist: false,
  });
  toggleMovieFavorite.mockResolvedValue({ action: "ADDED", success: true });
  const { result } = renderHook(() => useToggleMovieFavorite(movieId), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.mutateAsync();
  });

  expect(
    queryClient.getQueryData(catalogKeys.movieUserData(movieId)),
  ).toMatchObject({ isFavorite: true, inWatchlist: false });
  queryClient.clear();
});

test("watchlist mutation updates the cached filled state", async () => {
  const queryClient = createQueryClient();
  queryClient.setQueryData(catalogKeys.movieUserData(movieId), {
    isFavorite: false,
    inWatchlist: false,
  });
  toggleMovieWatchlist.mockResolvedValue({ action: "ADDED", success: true });
  const { result } = renderHook(() => useToggleMovieWatchlist(movieId), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.mutateAsync();
  });

  expect(
    queryClient.getQueryData(catalogKeys.movieUserData(movieId)),
  ).toMatchObject({ isFavorite: false, inWatchlist: true });
  queryClient.clear();
});
