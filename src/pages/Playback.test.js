import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import {
  completePlayback,
  createPlaybackSession,
  updatePlaybackProgress,
} from "../api/watchApi";
import Playback from "./Playback";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../api/watchApi", () => ({
  completePlayback: jest.fn(),
  createPlaybackSession: jest.fn(),
  updatePlaybackProgress: jest.fn(() => Promise.resolve()),
}));

jest.mock("../components/watch/HlsVideoPlayer", () =>
  function MockPlayer({ onEnded, onProgress }) {
    return (
      <>
        <button onClick={() => onProgress(73)} type="button">
          Mock player
        </button>
        <button onClick={() => onEnded(120)} type="button">
          Finish movie
        </button>
      </>
    );
  },
);

const movieId = "6a1e54e7be4244a731af7b07";

test("flushes the latest playback progress when the page closes", async () => {
  getAuthToken.mockReturnValue("test-token");
  updatePlaybackProgress.mockResolvedValue(undefined);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={[
          {
            pathname: `/playback/${movieId}`,
            state: {
              playbackSession: {
                access: { currentTime: 12, orderId: "order-1" },
                movie: { id: movieId, title: "The Story" },
                playback: {
                  expiresIn: 300,
                  url: "https://example.com/movie.m3u8",
                },
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/playback/:movieId" element={<Playback />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Mock player" }));
  act(() => window.dispatchEvent(new Event("pagehide")));

  await waitFor(() => {
    expect(updatePlaybackProgress).toHaveBeenCalledWith({
      orderId: "order-1",
      currentTime: 73,
      keepalive: true,
    });
  });
});

test("marks an ended movie complete and can restart it", async () => {
  getAuthToken.mockReturnValue("test-token");
  updatePlaybackProgress.mockResolvedValue(undefined);
  completePlayback.mockResolvedValue({ code: "PLAYBACK_COMPLETED" });
  createPlaybackSession.mockResolvedValue({
    access: { currentTime: 0, orderId: "order-1" },
    movie: { id: movieId, title: "The Story" },
    playback: {
      expiresIn: 300,
      token: "new-token",
      url: "https://example.com/movie-replay.m3u8",
    },
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={[
          {
            pathname: `/playback/${movieId}`,
            state: {
              playbackSession: {
                access: { currentTime: 0, orderId: "order-1" },
                movie: { id: movieId, title: "The Story" },
                playback: {
                  expiresIn: 300,
                  url: "https://example.com/movie.m3u8",
                },
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/playback/:movieId" element={<Playback />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Finish movie" }));

  expect(
    await screen.findByRole("heading", { name: "You finished The Story" }),
  ).toBeInTheDocument();
  expect(completePlayback).toHaveBeenCalledWith({
    orderId: "order-1",
    currentTime: 120,
  });

  fireEvent.click(screen.getByRole("button", { name: "Watch Again" }));

  await waitFor(() => {
    expect(createPlaybackSession).toHaveBeenCalledWith(movieId);
  });
});
