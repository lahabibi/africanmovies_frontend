import { ensureDeviceId } from "./authToken";
import { apiClient } from "./client";
import { enrichCurrentDevice, verifyOtp } from "./authApi";
import { getDeviceMetadata } from "../utils/deviceInfo";

jest.mock("./client", () => ({ apiClient: jest.fn() }));
jest.mock("./authToken", () => ({ ensureDeviceId: jest.fn() }));
jest.mock("../utils/deviceInfo", () => ({ getDeviceMetadata: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  apiClient.mockResolvedValue({ success: true });
  ensureDeviceId.mockReturnValue("device-123");
  getDeviceMetadata.mockReturnValue({
    deviceName: "Chrome on macOS",
    deviceType: "Desktop",
    os: "macOS",
    platform: "MacIntel",
    userAgentName: "Chrome",
  });
});

test("keeps OTP verification limited to credentials and the stable device id", async () => {
  await verifyOtp({ email: "viewer@example.com", otp: "123456" });

  expect(apiClient).toHaveBeenCalledWith("/auth/verify-otp", {
    body: {
      deviceId: "device-123",
      email: "viewer@example.com",
      otp: "123456",
    },
    requireAuth: false,
  });
  expect(getDeviceMetadata).not.toHaveBeenCalled();
});

test("posts browser metadata through the authenticated enrichment endpoint", async () => {
  await enrichCurrentDevice();

  expect(apiClient).toHaveBeenCalledWith("/auth/devices/enrich", {
    body: {
      deviceName: "Chrome on macOS",
      deviceType: "Desktop",
      os: "macOS",
      platform: "MacIntel",
      userAgentName: "Chrome",
    },
    method: "POST",
  });
});
