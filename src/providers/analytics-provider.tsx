"use client";

import {Analytics as VercelAnalytics} from "@vercel/analytics/react";
import {ReactNode, createContext, useContext, useEffect, useMemo} from "react";

import {AnalyticsEvent, createAnalytics} from "../utils/analytics";

type AnalyticsContextValue = {
  push: (event: AnalyticsEvent) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
  locale: string;
};

export function AnalyticsProvider({children, locale}: Props) {
  const analytics = useMemo(() => createAnalytics(locale), [locale]);

  useEffect(() => {
    analytics.push({
      event: "page_view",
      locale
    });
  }, [analytics, locale]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
      <VercelAnalytics />
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const ctx = useContext(AnalyticsContext);

  if (!ctx) {
    throw new Error("useAnalyticsContext must be used within AnalyticsProvider");
  }

  return ctx;
}

export const useAnalytics = useAnalyticsContext;
