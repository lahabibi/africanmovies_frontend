import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  useCurrentUser,
  useDeleteProfileImage,
  useUpdateUsername,
  useUploadProfileImage,
} from "../hooks/useAuth";
import Profile from "./Profile";

jest.mock("../hooks/useAuth", () => ({
  useCurrentUser: jest.fn(),
  useDeleteProfileImage: jest.fn(),
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
  updateUsername.mockResolvedValue({});
  uploadProfileImage.mockResolvedValue({});
  deleteProfileImage.mockResolvedValue({});
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
