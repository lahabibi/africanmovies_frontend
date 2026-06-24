import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { IS_HOLDING_PAGE } from "../config/siteMode";
import ConnectivityProvider from "./ConnectivityProvider";

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {IS_HOLDING_PAGE ? (
        children
      ) : (
        <ConnectivityProvider>{children}</ConnectivityProvider>
      )}
    </QueryClientProvider>
  );
}

export default AppProviders;
