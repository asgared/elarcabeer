export type AnalyticsEvent = {
  event: string;
  [key: string]: unknown;
};

type Analytics = {
  push: (event: AnalyticsEvent) => void;
};

export function createAnalytics(locale: string): Analytics {
  const ensureDataLayer = () => {
    if (typeof window === "undefined") return;

    if (!("dataLayer" in window)) {
      (window as typeof window & {dataLayer: AnalyticsEvent[]}).dataLayer = [];
    }
  };

  return {
    push: (event) => {
      if (typeof window === "undefined") return;

      ensureDataLayer();
      const payload = {...event, locale};
      (window as typeof window & {dataLayer: AnalyticsEvent[]}).dataLayer.push(payload);
    }
  };
}
