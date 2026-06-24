import { apiClient } from "./client";
import { getBackendHealth } from "./healthApi";

jest.mock("./client", () => ({
  apiClient: jest.fn(),
}));

test("checks health relative to the configured API base URL", async () => {
  const controller = new AbortController();
  apiClient.mockResolvedValueOnce({ status: "OK" });

  await getBackendHealth({ signal: controller.signal });

  expect(apiClient).toHaveBeenCalledWith("/health", {
    cache: "no-store",
    monitorConnection: false,
    requireAuth: false,
    signal: controller.signal,
  });
});
