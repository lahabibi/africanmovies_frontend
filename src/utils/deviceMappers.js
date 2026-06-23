export function mapDeviceSession(device = {}, now = new Date()) {
  const platform = [device.platform, device.os].filter(Boolean).join(" · ");
  const location = [device.city, device.country].filter(Boolean).join(", ");

  return {
    id: String(device._id || device.id || ""),
    isCurrent: device.isCurrent === true,
    location: location || "Location unavailable",
    name:
      device.deviceName ||
      [device.platform, device.os].filter(Boolean).join(" on ") ||
      "Unknown Device",
    platform: platform || device.userAgentName || "Unknown platform",
    status: device.isCurrent
      ? "Active now"
      : `Last active: ${formatLastActive(device.lastActiveAt, now)}`,
    type: normalizeDeviceType(device.deviceType),
  };
}

function normalizeDeviceType(value) {
  const type = value?.toString().toLowerCase() || "";

  if (/mobile|phone|iphone|android/.test(type)) return "phone";
  if (/tv|television/.test(type)) return "tv";
  return "laptop";
}

function formatLastActive(value, now) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);
  const daysAgo = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000,
  );
  const time = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (daysAgo === 0) return `Today, ${time}`;
  if (daysAgo === 1) return `Yesterday, ${time}`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}
