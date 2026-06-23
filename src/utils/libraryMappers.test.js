import { mapLibraryItem } from "./libraryMappers";

const NOW = new Date("2026-06-22T12:00:00.000Z");

test("maps library progress and active time remaining", () => {
  const item = mapLibraryItem(
    {
      id: "order-1",
      movieId: "movie-1",
      title: "Active Story",
      duration: 120,
      currentTime: 1800,
      expiryDate: "2026-06-25T12:00:00.000Z",
      startWatch: true,
      status: "active",
    },
    NOW,
  );

  expect(item).toMatchObject({
    progress: 25,
    slug: "movie-1",
    statusLabel: "Active",
    timeLabel: "3d left",
  });
});

test("uses only the movie thumbnail for library artwork", () => {
  const withThumbnail = mapLibraryItem({
    image: "banner.jpg",
    movieId: "movie-1",
    poster: "thumbnail.jpg",
  });
  const withoutThumbnail = mapLibraryItem({
    image: "banner-only.jpg",
    movieId: "movie-2",
  });

  expect(withThumbnail.image).toBe("thumbnail.jpg");
  expect(withoutThumbnail.image).toBe("");
});

test("maps expired access and completed playback labels", () => {
  const expired = mapLibraryItem(
    {
      movieId: "movie-expired",
      expiryDate: "2026-06-22T10:00:00.000Z",
      status: "expired",
    },
    NOW,
  );
  const completed = mapLibraryItem(
    {
      movieId: "movie-completed",
      duration: 90,
      playbackCompleted: true,
      status: "active",
    },
    NOW,
  );

  expect(expired.timeLabel).toBe("Expired 2h ago");
  expect(completed).toMatchObject({
    playbackCompleted: true,
    progress: 100,
    timeLabel: "Completed",
  });
});
