import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
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

function renderProvider({ strict = false } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const provider = (
    <QueryClientProvider client={queryClient}>
      <ConnectivityProvider>
        <div>Application content</div>
      </ConnectivityProvider>
    </QueryClientProvider>
  );

  return render(strict ? <StrictMode>{provider}</StrictMode> : provider);
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

test("does not report downtime when the startup check is restarted", async () => {
  getBackendHealth
    .mockImplementationOnce(({ signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener(
          "abort",
          () => {
            const error = new Error("Request cancelled");
            error.name = "AbortError";
            reject(error);
          },
          { once: true },
        );
      }),
    )
    .mockResolvedValueOnce({ status: "OK" });

  renderProvider({ strict: true });

  await waitFor(() => {
    expect(getBackendHealth).toHaveBeenCalledTimes(2);
  });

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    screen.queryByText("AfricanMovies servers can't be reached"),
  ).not.toBeInTheDocument();
});
