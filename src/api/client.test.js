import { apiClient } from "./client";
import {
  AUTH_SESSION_INVALIDATED_EVENT,
} from "./authSession";

jest.mock("../config/env", () => ({
  API_BASE_URL: "http://api.example.com",
}));

function jsonResponse(data, status) {
  return {
    headers: {
      get: () => "application/json",
    },
    json: async () => data,
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 403 ? "Forbidden" : "Unauthorized",
  };
}

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem("africanmovies.authToken", "token-123");
  window.localStorage.setItem("africanmovies.authUser", "{\"id\":\"user-1\"}");
  window.localStorage.setItem("africanmovies.deviceId", "device-123");
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("clears auth but preserves the device id when the session is revoked", async () => {
  const invalidated = jest.fn();
  window.addEventListener(AUTH_SESSION_INVALIDATED_EVENT, invalidated, {
    once: true,
  });
  global.fetch.mockResolvedValue(
    jsonResponse(
      {
        code: "INVALID_DEVICE",
        message: "Session expired. Please login again.",
      },
      403,
    ),
  );

  await expect(apiClient("/auth/devices")).rejects.toMatchObject({
    status: 403,
  });

  expect(window.localStorage.getItem("africanmovies.authToken")).toBeNull();
  expect(window.localStorage.getItem("africanmovies.authUser")).toBeNull();
  expect(window.localStorage.getItem("africanmovies.deviceId")).toBe(
    "device-123",
  );
  expect(invalidated).toHaveBeenCalledTimes(1);
});

test("does not clear auth for an ordinary forbidden response", async () => {
  global.fetch.mockResolvedValue(
    jsonResponse({ code: "FORBIDDEN", message: "Not allowed" }, 403),
  );

  await expect(apiClient("/restricted-action")).rejects.toMatchObject({
    status: 403,
  });

  expect(window.localStorage.getItem("africanmovies.authToken")).toBe(
    "token-123",
  );
});
