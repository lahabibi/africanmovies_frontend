export function mapLibraryItem(item = {}, now = new Date()) {
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const status = item.status || getStatus(expiryDate, now);
  const durationSeconds = Math.max(0, Number(item.duration) || 0) * 60;
  const currentTime = Math.max(0, Number(item.currentTime) || 0);
  const watchedSeconds = item.playbackCompleted
    ? durationSeconds || currentTime
    : durationSeconds
      ? Math.min(currentTime, durationSeconds)
      : currentTime;
  const progress = item.playbackCompleted
    ? 100
    : durationSeconds
      ? Math.min(100, Math.round((currentTime / durationSeconds) * 100))
      : 0;

  return {
    id: String(item.id || item.orderId || ""),
    movieId: String(item.movieId || ""),
    slug: String(item.movieId || item.slug || ""),
    title: item.title || "Untitled",
    image: item.poster || "",
    price: Math.max(0, Number(item.price) || 0),
    currency: item.currency || "USD",
    purchasedAt: item.purchasedAt || "",
    status,
    statusLabel:
      status === "expired"
        ? "Expired"
        : status === "expiring"
          ? "Expiring Soon"
          : "Active",
    timeLabel: getTimeLabel({
      expiryDate,
      isCompleted: item.playbackCompleted === true,
      now,
      startWatch: item.startWatch === true,
      status,
    }),
    accessTimeLabel: getAccessTimeLabel({ expiryDate, now, status }),
    progress,
    progressLabel: `${progress}% watched`,
    watchTimeLabel: getWatchTimeLabel({ durationSeconds, watchedSeconds }),
    watchSummaryLabel: getWatchSummaryLabel({
      durationSeconds,
      progress,
      watchedSeconds,
    }),
    playbackCompleted: item.playbackCompleted === true,
  };
}

function getStatus(expiryDate, now) {
  if (expiryDate && expiryDate <= now) return "expired";
  if (
    expiryDate &&
    expiryDate.getTime() - now.getTime() <= 48 * 60 * 60 * 1000
  ) {
    return "expiring";
  }
  return "active";
}

function getTimeLabel({ expiryDate, isCompleted, now, startWatch, status }) {
  if (status === "expired") {
    return `Expired ${formatElapsed(expiryDate, now)} ago`;
  }

  if (isCompleted) return "Completed";
  if (!startWatch) return "Ready to watch";
  if (!expiryDate) return "Active";

  return `${formatDuration(expiryDate.getTime() - now.getTime())} left`;
}

function getAccessTimeLabel({ expiryDate, now, status }) {
  if (status === "expired") {
    return `Expired ${formatElapsed(expiryDate, now)} ago`;
  }

  if (!expiryDate) return "Access active";

  return `Expires in ${formatDuration(expiryDate.getTime() - now.getTime())}`;
}

function getWatchSummaryLabel({ durationSeconds, progress, watchedSeconds }) {
  const watchTimeLabel = getWatchTimeLabel({ durationSeconds, watchedSeconds });

  return watchTimeLabel
    ? `${progress}% watched • ${watchTimeLabel}`
    : `${progress}% watched`;
}

function getWatchTimeLabel({ durationSeconds, watchedSeconds }) {
  if (!durationSeconds) {
    return watchedSeconds ? `${formatSeconds(watchedSeconds)} watched` : "";
  }

  return `${formatSeconds(watchedSeconds)} of ${formatSeconds(durationSeconds)}`;
}

function formatElapsed(date, now) {
  if (!date) return "recently";
  return formatDuration(now.getTime() - date.getTime());
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days) return hours ? `${days}d ${hours}h` : `${days}d`;
  if (hours) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

function formatSeconds(seconds) {
  const totalMinutes = Math.max(
    seconds > 0 ? 1 : 0,
    Math.round(Math.max(0, seconds) / 60),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
