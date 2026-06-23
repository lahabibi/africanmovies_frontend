import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function SignInDestination() {
  const location = useLocation();

  return <p>Sign in from {location.state?.from}</p>;
}

function renderProtectedRoute(initialEntry) {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[initialEntry]}
    >
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<h1>Private profile</h1>} />
        </Route>
        <Route path="/signin" element={<SignInDestination />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

test("redirects signed-out users and preserves the complete intended path", () => {
  renderProtectedRoute("/profile?panel=devices#active-devices");

  expect(
    screen.getByText(
      "Sign in from /profile?panel=devices#active-devices",
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText("Private profile")).not.toBeInTheDocument();
});

test("renders protected account content for an authenticated user", () => {
  window.localStorage.setItem("africanmovies.authToken", "token-123");

  renderProtectedRoute("/profile");

  expect(
    screen.getByRole("heading", { name: "Private profile" }),
  ).toBeInTheDocument();
});
