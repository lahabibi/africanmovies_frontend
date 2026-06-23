import { act, render } from "@testing-library/react";
import { getAuthToken, getDeviceId } from "../../api/authToken";
import { useCurrentUser, useEnrichCurrentDevice } from "../../hooks/useAuth";
import DeviceSessionEnricher from "./DeviceSessionEnricher";

jest.mock("../../api/authToken", () => ({
  getAuthToken: jest.fn(),
  getDeviceId: jest.fn(),
}));
jest.mock("../../hooks/useAuth", () => ({
  useCurrentUser: jest.fn(),
  useEnrichCurrentDevice: jest.fn(),
}));

const enrichDevice = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  window.sessionStorage.clear();
  getAuthToken.mockReturnValue("token-123");
  getDeviceId.mockReturnValue("device-123");
  useCurrentUser.mockReturnValue({ data: { _id: "user-123" } });
  useEnrichCurrentDevice.mockReturnValue({ mutate: enrichDevice });
});

afterEach(() => {
  jest.useRealTimers();
});

test("enriches an authenticated device after the app becomes idle", () => {
  render(<DeviceSessionEnricher />);

  expect(enrichDevice).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(enrichDevice).toHaveBeenCalledTimes(1);
});

test("does not enrich when there is no authenticated user", () => {
  useCurrentUser.mockReturnValue({ data: null });

  render(<DeviceSessionEnricher />);

  act(() => {
    jest.advanceTimersByTime(400);
  });

  expect(enrichDevice).not.toHaveBeenCalled();
});
