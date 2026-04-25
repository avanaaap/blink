import type { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
