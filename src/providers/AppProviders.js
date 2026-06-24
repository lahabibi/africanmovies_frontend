import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import ConnectivityProvider from "./ConnectivityProvider";

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectivityProvider>{children}</ConnectivityProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
