import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getAuthToken } from "../api/authToken";
import { updatePlaybackProgress } from "../api/watchApi";
import Playback from "./Playback";

jest.mock("../api/authToken", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../api/watchApi", () => ({
  createPlaybackSession: jest.fn(),
  updatePlaybackProgress: jest.fn(() => Promise.resolve()),
}));

jest.mock("../components/watch/HlsVideoPlayer", () =>
  function MockPlayer({ onProgress }) {
    return (
      <button onClick={() => onProgress(73)} type="button">
        Mock player
      </button>
    );
  },
);

const movieId = "6a1e54e7be4244a731af7b07";

test("flushes the latest playback progress when the page closes", async () => {
  getAuthToken.mockReturnValue("test-token");
  updatePlaybackProgress.mockResolvedValue(undefined);
  render(
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
    </MemoryRouter>,
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
