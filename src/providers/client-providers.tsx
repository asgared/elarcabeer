"use client";

import {ComponentProps} from "react";

import {AppProviders} from "./app-providers";

type ClientProvidersProps = ComponentProps<typeof AppProviders>;

export default function ClientProviders(props: ClientProvidersProps) {
  return <AppProviders {...props} />;
}
