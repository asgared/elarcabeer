import {ReactNode} from "react";

import {SiteAppLayout} from "@/components/layout/site-app-layout";

type Props = {
  children: ReactNode;
};

export default async function SiteSectionLayout({children}: Props) {
  return <SiteAppLayout>{children}</SiteAppLayout>;
}

