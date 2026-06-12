"use client"

// ChakraProvider is available but not mounted at root to avoid emotion SSR
// hydration mismatches. Add it per-layout when Chakra components are needed.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
