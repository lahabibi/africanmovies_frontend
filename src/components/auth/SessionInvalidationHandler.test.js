import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AUTH_SESSION_INVALIDATED_EVENT } from "../../api/authSession";
import SessionInvalidationHandler from "./SessionInvalidationHandler";

function LocationState() {
  const location = useLocation();

  return (
    <output>
      {location.pathname}|{location.state?.from}|{location.state?.sessionMessage}
    </output>
  );
}

test("clears cached data and redirects an invalid session to sign in", () => {
  const queryClient = new QueryClient();
  const clearCache = jest.spyOn(queryClient, "clear");

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={["/library?sort=recent#active"]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <SessionInvalidationHandler />
        <LocationState />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  act(() => {
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_INVALIDATED_EVENT, {
        detail: {
          message: "This device has been signed out.",
        },
      }),
    );
  });

  expect(clearCache).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/\/signin\|\/library\?sort=recent#active/)).toHaveTextContent(
    "/signin|/library?sort=recent#active|This device has been signed out.",
  );
});
