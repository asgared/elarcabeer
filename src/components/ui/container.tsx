import * as React from "react";

import {cn} from "@/lib/utils";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";
type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

const breakpointPrefixes: Record<Breakpoint, string> = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
  "2xl": "2xl:",
};

function toSpacingClasses(prefix: "px" | "py", value?: ResponsiveValue<number | string>) {
  if (!value) {
    return [];
  }

  if (typeof value === "number" || typeof value === "string") {
    return [`${prefix}-${value}`];
  }

  return Object.entries(value)
    .filter((entry): entry is [Breakpoint, number | string] => entry[1] !== undefined)
    .map(([breakpoint, val]) => `${breakpointPrefixes[breakpoint as Breakpoint]}${prefix}-${val}`);
}

const textAlignClassMap: Record<string, string | undefined> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const positionClassMap: Record<string, string | undefined> = {
  static: "static",
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
  sticky: "sticky",
};

const maxWidthClassMap: Record<string, string | undefined> = {
  "6xl": "max-w-6xl",
  "container.md": "max-w-3xl",
  full: "max-w-full",
};

export interface ContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children?: React.ReactNode;
  centerContent?: boolean;
  maxW?: string;
  px?: ResponsiveValue<number | string>;
  py?: ResponsiveValue<number | string>;
  textAlign?: "left" | "center" | "right";
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  zIndex?: number | string;
}

export function Container({
  children,
  centerContent,
  className,
  maxW,
  px,
  py,
  textAlign,
  position,
  zIndex,
  style,
  ...rest
}: ContainerProps) {
  const spacingClasses = [
    ...(px ? toSpacingClasses("px", px) : ["px-4", "md:px-6"]),
    ...toSpacingClasses("py", py),
  ];

  const textAlignClass = textAlign ? textAlignClassMap[textAlign] : undefined;
  const positionClass = position ? positionClassMap[position] : undefined;
  const maxWidthClass = maxW ? maxWidthClassMap[maxW] : undefined;

  const resolvedStyle: React.CSSProperties | undefined = (() => {
    if (maxW && !maxWidthClass) {
      return {...(style ?? {}), maxWidth: maxW};
    }
    return style;
  })();

  const baseStyle = resolvedStyle ?? {};
  const zIndexStyle = zIndex !== undefined ? {zIndex} : {};

  return (
    <div
      className={cn(
        "mx-auto w-full",
        centerContent && "flex flex-col items-center",
        maxWidthClass,
        textAlignClass,
        positionClass,
        spacingClasses,
        className,
      )}
      style={{...baseStyle, ...zIndexStyle}}
      {...rest}
    >
      {children}
    </div>
  );
}
