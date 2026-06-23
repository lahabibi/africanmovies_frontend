import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  useActiveDevices,
  useCurrentUser,
  useDeleteProfileImage,
  useLogoutDevice,
  useLogoutOtherDevices,
  useUpdateUsername,
  useUploadProfileImage,
} from "../hooks/useAuth";
import Profile from "./Profile";

jest.mock("../hooks/useAuth", () => ({
  useActiveDevices: jest.fn(),
  useCurrentUser: jest.fn(),
  useDeleteProfileImage: jest.fn(),
  useLogoutDevice: jest.fn(),
  useLogoutOtherDevices: jest.fn(),
  useUpdateUsername: jest.fn(),
  useUploadProfileImage: jest.fn(),
}));

jest.mock("../components/layout/AppShell", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../components/layout/Footer", () => () => null);
jest.mock("../components/account/AccountSidebar", () => () => null);

const updateUsername = jest.fn();
const uploadProfileImage = jest.fn();
const deleteProfileImage = jest.fn();
const logoutDevice = jest.fn();
const logoutOtherDevices = jest.fn();
const refetchCurrentUser = jest.fn();

function renderProfile() {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Profile />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useCurrentUser.mockReturnValue({
    data: {
      _id: "user-1",
      email: "viewer@example.com",
      name: "Current User",
      profileURL: "https://example.com/profile.jpg",
      username: "Current User",
    },
    isError: false,
    isLoading: false,
    refetch: refetchCurrentUser,
  });
  useUpdateUsername.mockReturnValue({
    isPending: false,
    mutateAsync: updateUsername,
  });
  useUploadProfileImage.mockReturnValue({
    isPending: false,
    mutateAsync: uploadProfileImage,
  });
  useDeleteProfileImage.mockReturnValue({
    isPending: false,
    mutateAsync: deleteProfileImage,
  });
  useActiveDevices.mockReturnValue({
    data: [
      {
        _id: "session-current",
        city: "Accra",
        country: "Ghana",
        deviceName: "Chrome on macOS",
        deviceType: "Desktop",
        isCurrent: true,
        lastActiveAt: "2026-06-23T12:00:00.000Z",
        os: "macOS",
        platform: "Chrome",
      },
      {
        _id: "session-tv",
        city: "Accra",
        country: "Ghana",
        deviceName: "Living Room TV",
        deviceType: "TV",
        isCurrent: false,
        lastActiveAt: "2026-06-22T12:00:00.000Z",
        os: "Tizen",
        platform: "Samsung",
      },
    ],
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
  useLogoutDevice.mockReturnValue({
    isPending: false,
    mutateAsync: logoutDevice,
    variables: null,
  });
  useLogoutOtherDevices.mockReturnValue({
    isPending: false,
    mutateAsync: logoutOtherDevices,
  });
  updateUsername.mockResolvedValue({});
  uploadProfileImage.mockResolvedValue({});
  deleteProfileImage.mockResolvedValue({});
  logoutDevice.mockResolvedValue({ success: true });
  logoutOtherDevices.mockResolvedValue({ success: true, revokedCount: 1 });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("shows only editable username with read-only email and English", () => {
  renderProfile();

  expect(screen.getByText("Current User")).toBeInTheDocument();
  expect(screen.getByText("viewer@example.com")).toBeInTheDocument();
  expect(screen.getByText("English")).toBeInTheDocument();
  expect(screen.queryByText("Phone Number")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Edit Email Address" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Change preferred language" }),
  ).not.toBeInTheDocument();
});

test("shows a stable profile skeleton while uncached user data loads", () => {
  useCurrentUser.mockReturnValue({
    data: null,
    isError: false,
    isLoading: true,
    refetch: refetchCurrentUser,
  });

  renderProfile();

  expect(
    screen.getByRole("status", { name: "Loading profile information" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Profile unavailable")).not.toBeInTheDocument();
});

test("shows a retry action when uncached profile data cannot load", () => {
  useCurrentUser.mockReturnValue({
    data: null,
    isError: true,
    isLoading: false,
    refetch: refetchCurrentUser,
  });

  renderProfile();
  fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

  expect(screen.getByText("Profile unavailable")).toBeInTheDocument();
  expect(refetchCurrentUser).toHaveBeenCalledTimes(1);
});

test("keeps cached profile data visible when a background refresh fails", () => {
  useCurrentUser.mockReturnValue({
    data: {
      _id: "user-1",
      email: "viewer@example.com",
      username: "Cached User",
    },
    isError: true,
    isLoading: false,
    refetch: refetchCurrentUser,
  });

  renderProfile();

  expect(screen.getByText("Cached User")).toBeInTheDocument();
  expect(screen.queryByText("Profile unavailable")).not.toBeInTheDocument();
});

test("updates the username when Save Changes is clicked", async () => {
  renderProfile();

  fireEvent.click(screen.getByRole("button", { name: "Edit Username" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Username" }), {
    target: { value: "Updated User" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

  await waitFor(() => {
    expect(updateUsername).toHaveBeenCalledWith("Updated User");
  });
  expect(
    await screen.findByText("Username updated successfully"),
  ).toBeInTheDocument();
});

test("uploads a selected profile picture", async () => {
  renderProfile();
  const file = new File(["profile"], "profile.png", { type: "image/png" });

  fireEvent.click(
    screen.getByRole("button", { name: "Change profile photo" }),
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "Upload photo" }));
  fireEvent.change(screen.getByLabelText("Upload profile photo"), {
    target: { files: [file] },
  });

  await waitFor(() => {
    expect(uploadProfileImage).toHaveBeenCalledWith(file);
  });
  expect(
    await screen.findByText("Profile picture updated successfully"),
  ).toBeInTheDocument();
});

test("shows a loader inside the avatar while a profile picture uploads", () => {
  useUploadProfileImage.mockReturnValue({
    isPending: true,
    mutateAsync: uploadProfileImage,
  });

  renderProfile();

  expect(
    screen.getByRole("status", { name: "Uploading profile picture" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Change profile photo" }),
  ).toBeDisabled();
});

test("removes the current profile picture", async () => {
  renderProfile();

  fireEvent.click(
    screen.getByRole("button", { name: "Change profile photo" }),
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "Remove photo" }));

  await waitFor(() => {
    expect(deleteProfileImage).toHaveBeenCalledTimes(1);
  });
  expect(await screen.findByText("Profile picture removed")).toBeInTheDocument();
});

test("shows the active device count and logs out a non-current device", async () => {
  renderProfile();

  expect(
    screen.getByRole("heading", { name: "Active Devices (2/2)" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Chrome on macOS")).toBeInTheDocument();
  expect(screen.getByText("Living Room TV")).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "Manage Living Room TV" }),
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "Logout Device" }));

  expect(logoutDevice).not.toHaveBeenCalled();
  expect(
    screen.getByRole("heading", { name: "Sign out Living Room TV?" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

  await waitFor(() => {
    expect(logoutDevice).toHaveBeenCalledWith("session-tv");
  });
  expect(await screen.findByText("Living Room TV signed out")).toBeInTheDocument();
});

test("logs out every device except the current one after confirmation", async () => {
  renderProfile();

  fireEvent.click(
    screen.getByRole("button", { name: "Sign out other devices" }),
  );
  expect(
    screen.getByRole("heading", { name: "Sign out other devices?" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

  await waitFor(() => {
    expect(logoutOtherDevices).toHaveBeenCalledTimes(1);
  });
  expect(await screen.findByText("Other device signed out")).toBeInTheDocument();
});
