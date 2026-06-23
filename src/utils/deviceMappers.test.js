import { mapDeviceSession } from "./deviceMappers";

const NOW = new Date("2026-06-23T14:00:00.000Z");

test("maps the current backend session for the devices panel", () => {
  expect(
    mapDeviceSession(
      {
        _id: "session-1",
        city: "Accra",
        country: "Ghana",
        deviceName: "Chrome on macOS",
        deviceType: "Desktop",
        isCurrent: true,
        os: "macOS",
        platform: "Chrome",
      },
      NOW,
    ),
  ).toMatchObject({
    id: "session-1",
    isCurrent: true,
    location: "Accra, Ghana",
    name: "Chrome on macOS",
    platform: "Chrome · macOS",
    status: "Active now",
    type: "laptop",
  });
});

test("maps a non-current TV session and its last-active label", () => {
  expect(
    mapDeviceSession(
      {
        _id: "session-2",
        deviceName: "Living Room TV",
        deviceType: "TV",
        isCurrent: false,
        lastActiveAt: "2026-06-22T12:30:00.000Z",
        os: "Tizen",
        platform: "Samsung",
      },
      NOW,
    ),
  ).toMatchObject({
    id: "session-2",
    name: "Living Room TV",
    status: expect.stringContaining("Yesterday"),
    type: "tv",
  });
});
