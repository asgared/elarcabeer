import type {Metadata} from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

type Props = {
  children: ReactNode;
};

export default function DashboardRootLayout({children}: Props) {
  return <>{children}</>;
}
