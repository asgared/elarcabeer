import { ReactNode } from "react";
type Props = { children: ReactNode; };

// Esto ahora es un layout "passthrough".
// Simplemente renderiza los hijos que recibe (la 'page.tsx').
// El layout real es manejado por app/dashboard/layout.tsx
export default function DashboardAdminLayout({ children }: Props) {
  return <>{children}</>;
}
