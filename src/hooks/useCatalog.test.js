import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getFavoriteMovies,
  toggleMovieFavorite,
  toggleMovieWatchlist,
} from "../api/catalogApi";
import {
  catalogKeys,
  useRemoveSavedMovie,
  useSavedMovies,
  useToggleMovieFavorite,
  useToggleMovieWatchlist,
} from "./useCatalog";

jest.mock("../api/catalogApi", () => ({
  ...jest.requireActual("../api/catalogApi"),
  getFavoriteMovies: jest.fn(),
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
  window.localStorage.clear();
});

test("loads and maps populated favorite records", async () => {
  window.localStorage.setItem("africanmovies.authToken", "test-token");
  getFavoriteMovies.mockResolvedValue([
    {
      _id: "favorite-entry",
      creationDate: "2026-06-21T10:00:00.000Z",
      movieId: {
        _id: movieId,
        actor: ["Actor One"],
        genre: "Drama",
        title: "Favorite Story",
      },
    },
  ]);
  const queryClient = createQueryClient();
  const { result } = renderHook(() => useSavedMovies("favorites"), {
    wrapper: createWrapper(queryClient),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual([
    expect.objectContaining({
      id: movieId,
      savedAt: "2026-06-21T10:00:00.000Z",
      title: "Favorite Story",
    }),
  ]);
  queryClient.clear();
});

test("removing a favorite updates saved and movie-detail caches", async () => {
  const queryClient = createQueryClient();
  queryClient.setQueryData(
    catalogKeys.savedMovies("favorites", "authenticated"),
    [
    { id: movieId, title: "Favorite Story" },
    ],
  );
  queryClient.setQueryData(catalogKeys.movieUserData(movieId), {
    isFavorite: true,
  });
  toggleMovieFavorite.mockResolvedValue({ action: "REMOVED", success: true });
  const { result } = renderHook(() => useRemoveSavedMovie("favorites"), {
    wrapper: createWrapper(queryClient),
  });

  await act(async () => {
    await result.current.mutateAsync(movieId);
  });

  expect(
    queryClient.getQueryData(
      catalogKeys.savedMovies("favorites", "authenticated"),
    ),
  ).toEqual([]);
  expect(
    queryClient.getQueryData(catalogKeys.movieUserData(movieId)),
  ).toMatchObject({ isFavorite: false });
  queryClient.clear();
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
