"use client";

import {createContext, useContext, useMemo, ReactNode, useCallback} from "react";

import type {AppLocale} from "./locales";

type Messages = Record<string, unknown>;

type IntlContextValue = {
  locale: AppLocale;
  messages: Messages;
};

const IntlContext = createContext<IntlContextValue | undefined>(undefined);

type IntlProviderProps = {
  locale: AppLocale;
  messages: Messages;
  children: ReactNode;
};

export function IntlProvider({locale, messages, children}: IntlProviderProps) {
  const value = useMemo(() => ({locale, messages}), [locale, messages]);
  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>;
}

export function useIntl() {
  const context = useContext(IntlContext);

  if (!context) {
    throw new Error("useIntl must be used within an IntlProvider");
  }

  return context;
}

function getMessageFromPath(messages: Messages, path: string): string | undefined {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, messages) as string | undefined;
}

export function useTranslations(namespace?: string) {
  const {messages} = useIntl();

  return useCallback(
    (key: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const value = getMessageFromPath(messages, fullKey);

      if (typeof value === "string") {
        return value;
      }

      return fullKey;
    },
    [messages, namespace]
  );
}

export function useLocale() {
  const {locale} = useIntl();
  return locale;
}
