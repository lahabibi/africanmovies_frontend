import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getBackendHealth } from "../api/healthApi";
import ConnectivityProvider from "./ConnectivityProvider";

jest.mock("../api/healthApi", () => ({
  getBackendHealth: jest.fn(),
}));

function setBrowserOnline(isOnline) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

function renderProvider() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ConnectivityProvider>
        <div>Application content</div>
      </ConnectivityProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  setBrowserOnline(true);
});

test("shows an offline message without calling the backend", () => {
  setBrowserOnline(false);
  renderProvider();

  expect(screen.getByText("You're offline")).toBeInTheDocument();
  expect(getBackendHealth).not.toHaveBeenCalled();
});

test("shows backend downtime and recovers after a successful retry", async () => {
  getBackendHealth.mockRejectedValueOnce(new Error("Service unavailable"));
  renderProvider();

  expect(
    await screen.findByText("AfricanMovies servers can't be reached"),
  ).toBeInTheDocument();

  getBackendHealth.mockResolvedValueOnce({ status: "ok" });
  fireEvent.click(screen.getByRole("button", { name: /retry/i }));

  await waitFor(() => {
    expect(screen.getByText("You're back online")).toBeInTheDocument();
  });
});
