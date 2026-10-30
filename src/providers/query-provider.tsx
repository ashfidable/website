import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
}

// Keep the likes cache across article navigation, but never share it across SSR requests.
let browserClient: QueryClient | undefined;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    typeof window === "undefined" ? createClient() : (browserClient ??= createClient()),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
